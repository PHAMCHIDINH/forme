package todo

import (
	"context"
	"errors"
	"strings"
	"time"
)

type Service struct {
	repository TodoStore
}

var (
	ErrInvalidTitle    = errors.New("title is required")
	ErrTitleTooLong    = errors.New("title must be at most 200 characters")
	ErrInvalidView     = errors.New("invalid view")
	ErrInvalidStatus   = errors.New("invalid status")
	ErrInvalidPriority = errors.New("invalid priority")
)

type TodoStore interface {
	List(ctx context.Context, ownerID string) ([]Item, error)
	ListWithOptions(ctx context.Context, ownerID string, opts ListOptions) ([]Item, error)
	Create(ctx context.Context, ownerID string, title string) (Item, error)
	CreateV2(ctx context.Context, ownerID string, params CreateParams) (Item, error)
	Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error)
	UpdateV2(ctx context.Context, ownerID string, todoID string, params UpdateParams) (Item, error)
	Delete(ctx context.Context, ownerID string, todoID string) error
}

func NewService(repository TodoStore) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context, ownerID string) ([]Item, error) {
	return s.ListV2(ctx, ownerID, ListOptions{})
}

func (s *Service) ListV2(ctx context.Context, ownerID string, opts ListOptions) ([]Item, error) {
	normalized, err := normalizeListOptions(opts)
	if err != nil {
		return nil, err
	}

	return s.repository.ListWithOptions(ctx, ownerID, normalized)
}

func (s *Service) Create(ctx context.Context, ownerID string, title string) (Item, error) {
	return s.CreateV2(ctx, ownerID, CreateParams{Title: title})
}

func (s *Service) CreateV2(ctx context.Context, ownerID string, params CreateParams) (Item, error) {
	if err := s.NormalizeCreateParams(&params); err != nil {
		return Item{}, err
	}

	return s.repository.CreateV2(ctx, ownerID, params)
}

func (s *Service) Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error) {
	params := UpdateParams{}
	if title != nil {
		params.Title.Set(*title)
	}
	if completed != nil {
		if *completed {
			params.Status.Set(StatusDone)
		} else {
			params.Status.Set(StatusTodo)
		}
	}

	return s.UpdateV2(ctx, ownerID, todoID, params)
}

func (s *Service) UpdateV2(ctx context.Context, ownerID string, todoID string, params UpdateParams) (Item, error) {
	if err := s.NormalizeUpdateParams(&params); err != nil {
		return Item{}, err
	}

	return s.repository.UpdateV2(ctx, ownerID, todoID, params)
}

func (s *Service) Delete(ctx context.Context, ownerID string, todoID string) error {
	return s.repository.Delete(ctx, ownerID, todoID)
}

func (s *Service) NormalizeCreateParams(params *CreateParams) error {
	params.Normalize()

	title, err := normalizeTitleText(params.Title)
	if err != nil {
		return err
	}
	params.Title = title

	status, err := normalizeStatusValue(params.Status, true)
	if err != nil {
		return err
	}
	params.Status = status

	priority, err := normalizePriorityValue(params.Priority, true)
	if err != nil {
		return err
	}
	params.Priority = priority

	params.Tags = normalizeTags(params.Tags)
	if params.Status == StatusDone {
		now := time.Now().UTC()
		params.CompletedAt = &now
	} else {
		params.CompletedAt = nil
	}

	return nil
}

func (s *Service) NormalizeUpdateParams(params *UpdateParams) error {
	params.Normalize()

	if params.Title.Present {
		if params.Title.Null {
			return ErrInvalidTitle
		}
		title, err := normalizeTitleText(params.Title.Value)
		if err != nil {
			return err
		}
		params.Title.Set(title)
	}
	if params.Status.Present {
		if params.Status.Null {
			return ErrInvalidStatus
		}
		status, err := normalizeStatusValue(params.Status.Value, false)
		if err != nil {
			return err
		}
		params.Status.Set(status)
		if status == StatusDone {
			now := time.Now().UTC()
			params.CompletedAt.Set(now)
		} else {
			params.CompletedAt.Clear()
		}
	} else if params.CompletedAt.Present {
		params.CompletedAt.Clear()
	}
	if params.Priority.Present {
		if params.Priority.Null {
			return ErrInvalidPriority
		}
		priority, err := normalizePriorityValue(params.Priority.Value, false)
		if err != nil {
			return err
		}
		params.Priority.Set(priority)
	}
	if params.DueAt.Present && params.DueAt.Null {
		params.DueAt.Clear()
	}
	if params.Tags.Present {
		if params.Tags.Null {
			params.Tags.Clear()
		} else {
			params.Tags.Set(normalizeTags(params.Tags.Value))
		}
	}
	if params.ArchivedAt.Present && params.ArchivedAt.Null {
		params.ArchivedAt.Clear()
	}

	return nil
}

func normalizeListOptions(opts ListOptions) (ListOptions, error) {
	opts.View = strings.ToLower(strings.TrimSpace(opts.View))
	opts.Search = strings.TrimSpace(opts.Search)
	opts.Tag = strings.ToLower(strings.TrimSpace(opts.Tag))

	switch opts.View {
	case "", "active", "today", "upcoming", "overdue", "completed", "archived":
	default:
		return ListOptions{}, ErrInvalidView
	}
	if opts.Status != "" && !isValidStatus(opts.Status) {
		return ListOptions{}, ErrInvalidStatus
	}

	return opts, nil
}

func normalizeTitleText(title string) (string, error) {
	trimmed := strings.TrimSpace(title)
	if trimmed == "" {
		return "", ErrInvalidTitle
	}
	if len(trimmed) > 200 {
		return "", ErrTitleTooLong
	}

	return trimmed, nil
}

func normalizeStatusValue(status Status, allowDefault bool) (Status, error) {
	switch status {
	case "":
		if allowDefault {
			return StatusTodo, nil
		}
		return "", ErrInvalidStatus
	case StatusTodo, StatusInProgress, StatusDone, StatusCancelled:
		return status, nil
	default:
		return "", ErrInvalidStatus
	}
}

func normalizePriorityValue(priority Priority, allowDefault bool) (Priority, error) {
	switch priority {
	case "":
		if allowDefault {
			return PriorityMedium, nil
		}
		return "", ErrInvalidPriority
	case PriorityLow, PriorityMedium, PriorityHigh:
		return priority, nil
	default:
		return "", ErrInvalidPriority
	}
}

func normalizeTags(tags []string) []string {
	normalized := make([]string, 0, len(tags))
	seen := make(map[string]struct{}, len(tags))

	for _, tag := range tags {
		tag = strings.TrimSpace(strings.ToLower(tag))
		if tag == "" {
			continue
		}
		if _, ok := seen[tag]; ok {
			continue
		}
		seen[tag] = struct{}{}
		normalized = append(normalized, tag)
	}

	return normalized
}
