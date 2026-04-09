package journal

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

type Repository struct {
	queries *db.Queries
}

func NewRepository(queries *db.Queries) *Repository {
	return &Repository{queries: queries}
}

func (r *Repository) List(ctx context.Context, ownerID string) ([]Entry, error) {
	rows, err := r.queries.ListJournalEntriesByOwner(ctx, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to list journal entries: %w", err)
	}

	items := make([]Entry, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapJournalEntryRow(row))
	}

	return items, nil
}

func (r *Repository) Create(ctx context.Context, ownerID string, params CreateParams) (Entry, error) {
	row, err := r.queries.CreateJournalEntry(ctx, db.CreateJournalEntryParams{
		ID:         uuid.New(),
		OwnerID:    ownerID,
		Type:       string(params.Type),
		Title:      params.Title,
		ImageURL:   textPtrToPgtype(params.ImageURL),
		SourceURL:  textPtrToPgtype(params.SourceURL),
		Review:     textPtrToPgtype(params.Review),
		ConsumedOn: dateOnlyToPgtype(params.ConsumedOn),
	})
	if err != nil {
		return Entry{}, fmt.Errorf("failed to create journal entry: %w", err)
	}

	return mapJournalEntryRow(row), nil
}

func (r *Repository) Update(ctx context.Context, ownerID string, entryID string, params UpdateParams) (Entry, error) {
	entryUUID, err := uuid.Parse(entryID)
	if err != nil {
		return Entry{}, ErrNotFound
	}

	row, err := r.queries.UpdateJournalEntry(ctx, db.UpdateJournalEntryParams{
		SetType:       params.Type.Present,
		Type:          string(params.Type.Value),
		SetTitle:      params.Title.Present,
		Title:         params.Title.Value,
		SetImageURL:   params.ImageURL.Present,
		ImageURL:      textPtrToPgtype(optionalStringPtr(params.ImageURL)),
		SetSourceURL:  params.SourceURL.Present,
		SourceURL:     textPtrToPgtype(optionalStringPtr(params.SourceURL)),
		SetReview:     params.Review.Present,
		Review:        textPtrToPgtype(optionalStringPtr(params.Review)),
		SetConsumedOn: params.ConsumedOn.Present,
		ConsumedOn:    dateOnlyToPgtype(params.ConsumedOn.Value),
		UpdatedAt:     pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
		ID:            entryUUID,
		OwnerID:       ownerID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Entry{}, ErrNotFound
		}
		return Entry{}, fmt.Errorf("failed to update journal entry: %w", err)
	}

	return mapJournalEntryRow(row), nil
}

func (r *Repository) Delete(ctx context.Context, ownerID string, entryID string) error {
	entryUUID, err := uuid.Parse(entryID)
	if err != nil {
		return ErrNotFound
	}

	rowsAffected, err := r.queries.DeleteJournalEntryByIDAndOwner(ctx, db.DeleteJournalEntryByIDAndOwnerParams{
		ID:      entryUUID,
		OwnerID: ownerID,
	})
	if err != nil {
		return fmt.Errorf("failed to delete journal entry: %w", err)
	}
	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func mapJournalEntryRow(item db.JournalEntry) Entry {
	return Entry{
		ID:         item.ID.String(),
		Type:       EntryType(item.Type),
		Title:      item.Title,
		ImageURL:   stringPtrFromPgtype(item.ImageURL),
		SourceURL:  stringPtrFromPgtype(item.SourceURL),
		Review:     stringPtrFromPgtype(item.Review),
		ConsumedOn: DateOnlyFromTime(item.ConsumedOn.Time),
		CreatedAt:   item.CreatedAt.Time.UTC(),
		UpdatedAt:   item.UpdatedAt.Time.UTC(),
	}
}

func stringPtrFromPgtype(value pgtype.Text) *string {
	if !value.Valid {
		return nil
	}

	return &value.String
}

func textPtrToPgtype(value *string) pgtype.Text {
	if value == nil {
		return pgtype.Text{}
	}

	return pgtype.Text{String: *value, Valid: true}
}

func dateOnlyToPgtype(value DateOnly) pgtype.Date {
	return pgtype.Date{Time: value.Time, Valid: !value.Time.IsZero()}
}

func optionalStringPtr(field PatchField[string]) *string {
	if field.HasValue() {
		return &field.Value
	}

	return nil
}
