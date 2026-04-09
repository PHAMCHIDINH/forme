package journal

import "context"

type Service struct {
	repository JournalStore
}

type JournalStore interface {
	List(ctx context.Context, ownerID string) ([]Entry, error)
	Create(ctx context.Context, ownerID string, params CreateParams) (Entry, error)
	Update(ctx context.Context, ownerID string, entryID string, params UpdateParams) (Entry, error)
	Delete(ctx context.Context, ownerID string, entryID string) error
}

func NewService(repository JournalStore) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context, ownerID string) ([]Entry, error) {
	return s.repository.List(ctx, ownerID)
}

func (s *Service) Create(ctx context.Context, ownerID string, params CreateParams) (Entry, error) {
	if err := s.NormalizeCreateParams(&params); err != nil {
		return Entry{}, err
	}

	return s.repository.Create(ctx, ownerID, params)
}

func (s *Service) Update(ctx context.Context, ownerID string, entryID string, params UpdateParams) (Entry, error) {
	if err := s.NormalizeUpdateParams(&params); err != nil {
		return Entry{}, err
	}

	return s.repository.Update(ctx, ownerID, entryID, params)
}

func (s *Service) Delete(ctx context.Context, ownerID string, entryID string) error {
	return s.repository.Delete(ctx, ownerID, entryID)
}

func (s *Service) NormalizeCreateParams(params *CreateParams) error {
	params.Normalize()

	normalizedType, err := normalizeEntryType(params.Type)
	if err != nil {
		return err
	}
	params.Type = normalizedType

	title, err := normalizeTitle(params.Title)
	if err != nil {
		return err
	}
	params.Title = title

	consumedOn, err := normalizeDateOnly(params.ConsumedOn)
	if err != nil {
		return err
	}
	params.ConsumedOn = consumedOn

	if params.ImageURL != nil {
		normalized, err := normalizeURL(*params.ImageURL, ErrInvalidImageURL, true)
		if err != nil {
			return err
		}
		params.ImageURL = &normalized
	}

	if params.SourceURL != nil {
		normalized, err := normalizeURL(*params.SourceURL, ErrInvalidSourceURL, false)
		if err != nil {
			return err
		}
		params.SourceURL = &normalized
	}

	return nil
}

func (s *Service) NormalizeUpdateParams(params *UpdateParams) error {
	params.Normalize()

	if !params.Type.Present && !params.Title.Present && !params.ImageURL.Present && !params.SourceURL.Present && !params.Review.Present && !params.ConsumedOn.Present {
		return ErrInvalidUpdate
	}

	if params.Type.Present {
		if params.Type.Null {
			return ErrInvalidType
		}
		normalizedType, err := normalizeEntryType(params.Type.Value)
		if err != nil {
			return err
		}
		params.Type.Set(normalizedType)
	}

	if params.Title.Present {
		if params.Title.Null {
			return ErrInvalidTitle
		}
		title, err := normalizeTitle(params.Title.Value)
		if err != nil {
			return err
		}
		params.Title.Set(title)
	}

	if params.ImageURL.Present {
		if params.ImageURL.Null {
			params.ImageURL.Clear()
		} else {
			normalized, err := normalizeURL(params.ImageURL.Value, ErrInvalidImageURL, true)
			if err != nil {
				return err
			}
			params.ImageURL.Set(normalized)
		}
	}

	if params.SourceURL.Present {
		if params.SourceURL.Null {
			params.SourceURL.Clear()
		} else {
			normalized, err := normalizeURL(params.SourceURL.Value, ErrInvalidSourceURL, false)
			if err != nil {
				return err
			}
			params.SourceURL.Set(normalized)
		}
	}

	if params.ConsumedOn.Present {
		if params.ConsumedOn.Null {
			return ErrInvalidConsumedOn
		}
		normalized, err := normalizeDateOnly(params.ConsumedOn.Value)
		if err != nil {
			return err
		}
		params.ConsumedOn.Set(normalized)
	}

	if params.Review.Present && params.Review.Null {
		params.Review.Clear()
	}

	return nil
}
