package todo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("todo not found")

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) List(ctx context.Context, ownerID string) ([]Item, error) {
	rows, err := r.pool.Query(ctx, `
SELECT id::text, title, completed, created_at, updated_at
FROM todos
WHERE owner_id = $1
ORDER BY created_at DESC
`, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to list todos: %w", err)
	}
	defer rows.Close()

	items := make([]Item, 0)
	for rows.Next() {
		var item Item
		if err := rows.Scan(&item.ID, &item.Title, &item.Completed, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan todo row: %w", err)
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *Repository) Create(ctx context.Context, ownerID string, title string) (Item, error) {
	id := uuid.New().String()
	var item Item
	err := r.pool.QueryRow(ctx, `
INSERT INTO todos (id, owner_id, title, completed)
VALUES ($1, $2, $3, false)
RETURNING id::text, title, completed, created_at, updated_at
`, id, ownerID, title).Scan(&item.ID, &item.Title, &item.Completed, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return Item{}, fmt.Errorf("failed to create todo: %w", err)
	}

	return item, nil
}

func (r *Repository) Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error) {
	var (
		nextTitle     *string
		nextCompleted *bool
	)

	err := r.pool.QueryRow(ctx, `
SELECT title, completed
FROM todos
WHERE id = $1::uuid AND owner_id = $2
`, todoID, ownerID).Scan(&nextTitle, &nextCompleted)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Item{}, ErrNotFound
		}
		return Item{}, fmt.Errorf("failed to load todo before update: %w", err)
	}

	if title != nil {
		nextTitle = title
	}
	if completed != nil {
		nextCompleted = completed
	}

	var item Item
	err = r.pool.QueryRow(ctx, `
UPDATE todos
SET title = $3, completed = $4, updated_at = $5
WHERE id = $1::uuid AND owner_id = $2
RETURNING id::text, title, completed, created_at, updated_at
`, todoID, ownerID, *nextTitle, *nextCompleted, time.Now().UTC()).
		Scan(&item.ID, &item.Title, &item.Completed, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Item{}, ErrNotFound
		}
		return Item{}, fmt.Errorf("failed to update todo: %w", err)
	}

	return item, nil
}

func (r *Repository) Delete(ctx context.Context, ownerID string, todoID string) error {
	result, err := r.pool.Exec(ctx, `
DELETE FROM todos
WHERE id = $1::uuid AND owner_id = $2
`, todoID, ownerID)
	if err != nil {
		return fmt.Errorf("failed to delete todo: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}
