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

	current, err := r.queries.GetJournalEntryByIDAndOwner(ctx, db.GetJournalEntryByIDAndOwnerParams{
		ID:      entryUUID,
		OwnerID: ownerID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Entry{}, ErrNotFound
		}
		return Entry{}, fmt.Errorf("failed to load journal entry before update: %w", err)
	}

	next := journalWriteStateFromRow(current)

	if params.Type.Present {
		if params.Type.Null {
			return Entry{}, ErrInvalidType
		}
		next.Type = params.Type.Value
	}
	if params.Title.Present {
		if params.Title.Null {
			return Entry{}, ErrInvalidTitle
		}
		next.Title = params.Title.Value
	}
	if params.ImageURL.Present {
		if params.ImageURL.Null {
			next.ImageURL = nil
		} else {
			next.ImageURL = stringPtrClone(params.ImageURL.Value)
		}
	}
	if params.SourceURL.Present {
		if params.SourceURL.Null {
			next.SourceURL = nil
		} else {
			next.SourceURL = stringPtrClone(params.SourceURL.Value)
		}
	}
	if params.Review.Present {
		if params.Review.Null {
			next.Review = nil
		} else {
			next.Review = stringPtrClone(params.Review.Value)
		}
	}
	if params.ConsumedOn.Present {
		if params.ConsumedOn.Null {
			return Entry{}, ErrInvalidConsumedOn
		}
		next.ConsumedOn = params.ConsumedOn.Value
	}

	row, err := r.queries.UpdateJournalEntry(ctx, db.UpdateJournalEntryParams{
		Type:       string(next.Type),
		Title:      next.Title,
		ImageURL:   textPtrToPgtype(next.ImageURL),
		SourceURL:  textPtrToPgtype(next.SourceURL),
		Review:     textPtrToPgtype(next.Review),
		ConsumedOn: dateOnlyToPgtype(next.ConsumedOn),
		UpdatedAt:   pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
		ID:         entryUUID,
		OwnerID:    ownerID,
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

type journalWriteState struct {
	Type       EntryType
	Title      string
	ImageURL   *string
	SourceURL  *string
	Review     *string
	ConsumedOn DateOnly
}

func journalWriteStateFromRow(item db.JournalEntry) journalWriteState {
	return journalWriteState{
		Type:       EntryType(item.Type),
		Title:      item.Title,
		ImageURL:   stringPtrFromPgtype(item.ImageURL),
		SourceURL:  stringPtrFromPgtype(item.SourceURL),
		Review:     stringPtrFromPgtype(item.Review),
		ConsumedOn: DateOnlyFromTime(item.ConsumedOn.Time),
	}
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

func stringPtrClone(value string) *string {
	clone := value
	return &clone
}

func stringPtrFromPgtype(value pgtype.Text) *string {
	if !value.Valid {
		return nil
	}

	return stringPtrClone(value.String)
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
