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

var businessLocation = time.FixedZone("Asia/Ho_Chi_Minh", 7*60*60)

type Repository struct {
	queries *db.Queries
}

type ListOptions struct {
	View   string
	Search string
	Tag    string
	Status Status
}

func NewRepository(queries *db.Queries) *Repository {
	return &Repository{queries: queries}
}

func (r *Repository) List(ctx context.Context, ownerID string) ([]Item, error) {
	return r.ListWithOptions(ctx, ownerID, ListOptions{})
}

func (r *Repository) ListWithOptions(ctx context.Context, ownerID string, opts ListOptions) ([]Item, error) {
	rows, err := r.queries.ListTodosByOwner(ctx, db.ListTodosByOwnerParams{
		OwnerID:  ownerID,
		ViewName: "",
		Search:   opts.Search,
		Tag:      opts.Tag,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list todos: %w", err)
	}

	now := time.Now().UTC()
	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		item := mapListTodoRow(row)
		if !matchesTodoView(item, opts.View, now) {
			continue
		}
		if opts.Status != "" && item.Status != opts.Status {
			continue
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *Repository) Create(ctx context.Context, ownerID string, title string) (Item, error) {
	return r.CreateV2(ctx, ownerID, CreateParams{Title: title})
}

func (r *Repository) CreateV2(ctx context.Context, ownerID string, params CreateParams) (Item, error) {
	status, priority := normalizeCreateState(params.Status, params.Priority)
	var completedAt *time.Time
	if status == StatusDone {
		now := time.Now().UTC()
		completedAt = &now
	}

	row, err := r.queries.CreateTodo(ctx, db.CreateTodoParams{
		ID:              uuid.New(),
		OwnerID:         ownerID,
		Title:           params.Title,
		DescriptionHtml: params.DescriptionHtml,
		Status:          string(status),
		Priority:        string(priority),
		DueAt:           timePtrToPgtype(params.DueAt),
		Tags:            cloneTags(params.Tags),
		CompletedAt:     timePtrToPgtype(completedAt),
		ArchivedAt:      timePtrToPgtype(params.ArchivedAt),
	})
	if err != nil {
		return Item{}, fmt.Errorf("failed to create todo: %w", err)
	}

	return mapCreateTodoRow(row), nil
}

func (r *Repository) Update(ctx context.Context, ownerID string, todoID string, title *string, completed *bool) (Item, error) {
	params := UpdateParams{}
	if title != nil {
		params.Title = NewPatchValue(*title)
	}
	if completed != nil {
		if *completed {
			params.Status = NewPatchValue(StatusDone)
			now := time.Now().UTC()
			params.CompletedAt = NewPatchValue(now)
		} else {
			params.Status = NewPatchValue(StatusTodo)
			params.CompletedAt = NewPatchNull[time.Time]()
		}
	}

	return r.UpdateV2(ctx, ownerID, todoID, params)
}

func (r *Repository) UpdateV2(ctx context.Context, ownerID string, todoID string, params UpdateParams) (Item, error) {
	todoUUID, err := uuid.Parse(todoID)
	if err != nil {
		return Item{}, ErrNotFound
	}

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

	next := todoWriteStateFromRow(current)
	statusProvided := params.Status.Present

	if params.Title.Present {
		if params.Title.Null {
			return Item{}, fmt.Errorf("title cannot be null")
		}
		next.Title = params.Title.Value
	}
	if params.DescriptionHtml.Present {
		if params.DescriptionHtml.Null {
			next.DescriptionHTML = ""
		} else {
			next.DescriptionHTML = params.DescriptionHtml.Value
		}
	}
	if params.Status.Present {
		if params.Status.Null {
			return Item{}, fmt.Errorf("status cannot be null")
		}
		next.Status = params.Status.Value
	}
	if params.Priority.Present {
		if params.Priority.Null {
			next.Priority = PriorityMedium
		} else {
			next.Priority = params.Priority.Value
		}
	}
	if params.DueAt.Present {
		if params.DueAt.Null {
			next.DueAt = nil
		} else {
			next.DueAt = timePtr(params.DueAt.Value)
		}
	}
	if params.Tags.Present {
		if params.Tags.Null {
			next.Tags = []string{}
		} else {
			next.Tags = cloneTags(params.Tags.Value)
		}
	}
	if params.ArchivedAt.Present {
		if params.ArchivedAt.Null {
			next.ArchivedAt = nil
		} else {
			next.ArchivedAt = timePtr(params.ArchivedAt.Value)
		}
	}

	if statusProvided {
		if next.Status == StatusDone {
			if next.CompletedAt == nil {
				now := time.Now().UTC()
				next.CompletedAt = &now
			}
		} else {
			next.CompletedAt = nil
		}
	}

	row, err := r.queries.UpdateTodo(ctx, db.UpdateTodoParams{
		ID:              todoUUID,
		OwnerID:         ownerID,
		Title:           next.Title,
		DescriptionHtml: next.DescriptionHTML,
		Status:          string(next.Status),
		Priority:        string(next.Priority),
		DueAt:           timePtrToPgtype(next.DueAt),
		Tags:            cloneTags(next.Tags),
		CompletedAt:     timePtrToPgtype(next.CompletedAt),
		ArchivedAt:      timePtrToPgtype(next.ArchivedAt),
		UpdatedAt:       pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Item{}, ErrNotFound
		}
		return Item{}, fmt.Errorf("failed to update todo: %w", err)
	}

	return mapUpdateTodoRow(row), nil
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

type todoWriteState struct {
	Title           string
	DescriptionHTML string
	Status          Status
	Priority        Priority
	DueAt           *time.Time
	Tags            []string
	CompletedAt     *time.Time
	ArchivedAt      *time.Time
}

func normalizeCreateState(status Status, priority Priority) (Status, Priority) {
	if status == "" {
		status = StatusTodo
	}
	if priority == "" {
		priority = PriorityMedium
	}

	return status, priority
}

func todoWriteStateFromRow(item db.GetTodoByIDAndOwnerRow) todoWriteState {
	return todoWriteState{
		Title:           item.Title,
		DescriptionHTML: item.DescriptionHtml,
		Status:          Status(item.Status),
		Priority:        Priority(item.Priority),
		DueAt:           pgtypeToTimePtr(item.DueAt),
		Tags:            cloneTags(item.Tags),
		CompletedAt:     pgtypeToTimePtr(item.CompletedAt),
		ArchivedAt:      pgtypeToTimePtr(item.ArchivedAt),
	}
}

func mapTodoFields(
	id uuid.UUID,
	title string,
	descriptionHTML string,
	status string,
	priority string,
	dueAt pgtype.Timestamptz,
	tags []string,
	completed bool,
	completedAt pgtype.Timestamptz,
	archivedAt pgtype.Timestamptz,
	createdAt pgtype.Timestamptz,
	updatedAt pgtype.Timestamptz,
) Item {
	return Item{
		ID:              id.String(),
		Title:           title,
		DescriptionHtml: descriptionHTML,
		Status:          Status(status),
		Priority:        Priority(priority),
		DueAt:           pgtypeToTimePtr(dueAt),
		Tags:            cloneTags(tags),
		CompletedAt:     pgtypeToTimePtr(completedAt),
		ArchivedAt:      pgtypeToTimePtr(archivedAt),
		CreatedAt:       createdAt.Time,
		UpdatedAt:       updatedAt.Time,
		Completed:       completed || status == string(StatusDone),
	}
}

func pgtypeToTimePtr(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}

	normalized := value.Time.UTC()
	return &normalized
}

func timePtrToPgtype(value *time.Time) pgtype.Timestamptz {
	if value == nil {
		return pgtype.Timestamptz{}
	}

	return pgtype.Timestamptz{Time: value.UTC(), Valid: true}
}

func cloneTags(tags []string) []string {
	if tags == nil {
		return []string{}
	}

	return append([]string(nil), tags...)
}

func timePtr(value time.Time) *time.Time {
	normalized := value.UTC()
	return &normalized
}

func mapListTodoRow(item db.ListTodosByOwnerRow) Item {
	return mapTodoFields(
		item.ID,
		item.Title,
		item.DescriptionHtml,
		item.Status,
		item.Priority,
		item.DueAt,
		item.Tags,
		item.Completed,
		item.CompletedAt,
		item.ArchivedAt,
		item.CreatedAt,
		item.UpdatedAt,
	)
}

func mapCreateTodoRow(item db.CreateTodoRow) Item {
	return mapTodoFields(
		item.ID,
		item.Title,
		item.DescriptionHtml,
		item.Status,
		item.Priority,
		item.DueAt,
		item.Tags,
		item.Completed,
		item.CompletedAt,
		item.ArchivedAt,
		item.CreatedAt,
		item.UpdatedAt,
	)
}

func mapGetTodoRow(item db.GetTodoByIDAndOwnerRow) Item {
	return mapTodoFields(
		item.ID,
		item.Title,
		item.DescriptionHtml,
		item.Status,
		item.Priority,
		item.DueAt,
		item.Tags,
		item.Completed,
		item.CompletedAt,
		item.ArchivedAt,
		item.CreatedAt,
		item.UpdatedAt,
	)
}

func mapUpdateTodoRow(item db.UpdateTodoRow) Item {
	return mapTodoFields(
		item.ID,
		item.Title,
		item.DescriptionHtml,
		item.Status,
		item.Priority,
		item.DueAt,
		item.Tags,
		item.Completed,
		item.CompletedAt,
		item.ArchivedAt,
		item.CreatedAt,
		item.UpdatedAt,
	)
}

func matchesTodoView(item Item, view string, now time.Time) bool {
	switch view {
	case "":
		return true
	case "active":
		return item.ArchivedAt == nil && item.Status != StatusDone && item.Status != StatusCancelled
	case "today":
		return item.ArchivedAt == nil && item.DueAt != nil && sameBusinessDay(*item.DueAt, now)
	case "upcoming":
		return item.ArchivedAt == nil && item.DueAt != nil && businessDay(*item.DueAt).After(businessDay(now))
	case "overdue":
		return item.ArchivedAt == nil && item.DueAt != nil && item.Status != StatusDone && businessDay(*item.DueAt).Before(businessDay(now))
	case "completed":
		return item.ArchivedAt == nil && item.Status == StatusDone
	case "archived":
		return item.ArchivedAt != nil
	default:
		return false
	}
}

func sameBusinessDay(a, b time.Time) bool {
	return businessDay(a).Equal(businessDay(b))
}

func businessDay(ts time.Time) time.Time {
	normalized := ts.In(businessLocation)
	return time.Date(normalized.Year(), normalized.Month(), normalized.Day(), 0, 0, 0, 0, businessLocation)
}
