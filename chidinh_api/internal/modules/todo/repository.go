package todo

import (
	"context"
	"errors"
	"fmt"
	"time"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var ErrNotFound = errors.New("todo not found")

type Repository struct {
	queries *db.Queries
}

func NewRepository(queries *db.Queries) *Repository {
	return &Repository{queries: queries}
}

func (r *Repository) List(ctx context.Context, ownerID string) ([]Item, error) {
	rows, err := r.queries.ListTodosByOwner(ctx, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to list todos: %w", err)
	}

	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapDBTodo(row))
	}

	return items, nil
}

func (r *Repository) Create(ctx context.Context, ownerID string, title string) (Item, error) {
	item, err := r.queries.CreateTodo(ctx, db.CreateTodoParams{
		ID:      uuid.New(),
		OwnerID: ownerID,
		Title:   title,
	})
	if err != nil {
		return Item{}, fmt.Errorf("failed to create todo: %w", err)
	}

	return mapDBTodo(item), nil
}

func (r *Repository) Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error) {
	todoUUID, err := uuid.Parse(todoID)
	if err != nil {
		return Item{}, ErrNotFound
	}

	var (
		nextTitle     string
		nextCompleted bool
	)

	current, err := r.queries.GetTodoByIDAndOwner(ctx, db.GetTodoByIDAndOwnerParams{
		ID:      todoUUID,
		OwnerID: ownerID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Item{}, ErrNotFound
		}
		return Item{}, fmt.Errorf("failed to load todo before update: %w", err)
	}
	nextTitle = current.Title
	nextCompleted = current.Completed

	if title != nil {
		nextTitle = *title
	}
	if completed != nil {
		nextCompleted = *completed
	}

	item, err := r.queries.UpdateTodo(ctx, db.UpdateTodoParams{
		ID:        todoUUID,
		OwnerID:   ownerID,
		Title:     nextTitle,
		Completed: nextCompleted,
		UpdatedAt: pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Item{}, ErrNotFound
		}
		return Item{}, fmt.Errorf("failed to update todo: %w", err)
	}

	return mapDBTodo(item), nil
}

func (r *Repository) Delete(ctx context.Context, ownerID string, todoID string) error {
	todoUUID, err := uuid.Parse(todoID)
	if err != nil {
		return ErrNotFound
	}

	rowsAffected, err := r.queries.DeleteTodoByIDAndOwner(ctx, db.DeleteTodoByIDAndOwnerParams{
		ID:      todoUUID,
		OwnerID: ownerID,
	})
	if err != nil {
		return fmt.Errorf("failed to delete todo: %w", err)
	}
	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func mapDBTodo(item db.Todo) Item {
	return Item{
		ID:        item.ID.String(),
		Title:     item.Title,
		Completed: item.Completed,
		CreatedAt: item.CreatedAt.Time,
		UpdatedAt: item.UpdatedAt.Time,
	}
}
