package todo

import (
	"context"
	"fmt"
	"strings"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context, ownerID string) ([]Item, error) {
	return s.repository.List(ctx, ownerID)
}

func (s *Service) Create(ctx context.Context, ownerID string, title string) (Item, error) {
	normalizedTitle := strings.TrimSpace(title)
	if normalizedTitle == "" {
		return Item{}, fmt.Errorf("title is required")
	}
	if len(normalizedTitle) > 200 {
		return Item{}, fmt.Errorf("title must be at most 200 characters")
	}

	return s.repository.Create(ctx, ownerID, normalizedTitle)
}

func (s *Service) Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error) {
	if title != nil {
		trimmed := strings.TrimSpace(*title)
		if trimmed == "" {
			return Item{}, fmt.Errorf("title cannot be empty")
		}
		if len(trimmed) > 200 {
			return Item{}, fmt.Errorf("title must be at most 200 characters")
		}
		title = &trimmed
	}

	return s.repository.Update(ctx, ownerID, todoID, title, completed)
}

func (s *Service) Delete(ctx context.Context, ownerID string, todoID string) error {
	return s.repository.Delete(ctx, ownerID, todoID)
}
