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
	ErrInvalidStatus   = errors.New("invalid status")
	ErrInvalidPriority = errors.New("invalid priority")
)

type TodoStore interface {
	List(ctx context.Context, ownerID string) ([]Item, error)
	Create(ctx context.Context, ownerID string, title string) (Item, error)
	Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error)
	Delete(ctx context.Context, ownerID string, todoID string) error
}

func NewService(repository TodoStore) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context, ownerID string) ([]Item, error) {
	return s.repository.List(ctx, ownerID)
}

func (s *Service) Create(ctx context.Context, ownerID string, title string) (Item, error) {
	normalizedTitle, err := normalizeTitleText(title)
	if err != nil {
		return Item{}, err
	}

	return s.repository.Create(ctx, ownerID, normalizedTitle)
}

func (s *Service) Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error) {
	if title != nil {
		trimmed, err := normalizeTitleText(*title)
		if err != nil {
			return Item{}, err
		}
		title = &trimmed
	}

	return s.repository.Update(ctx, ownerID, todoID, title, completed)
}

func (s *Service) Delete(ctx context.Context, ownerID string, todoID string) error {
	return s.repository.Delete(ctx, ownerID, todoID)
}

func (s *Service) NormalizeCreateParams(params *CreateParams) error {
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
		if params.CompletedAt == nil {
			now := time.Now().UTC()
			params.CompletedAt = &now
		}
	} else {
		params.CompletedAt = nil
	}

	return nil
}

func (s *Service) NormalizeUpdateParams(params *UpdateParams) error {
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
			if params.CompletedAt.Present {
				if params.CompletedAt.Null {
					now := time.Now().UTC()
					params.CompletedAt.Set(now)
				}
			} else {
				now := time.Now().UTC()
				params.CompletedAt.Set(now)
			}
		} else {
			params.CompletedAt.Clear()
		}
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
