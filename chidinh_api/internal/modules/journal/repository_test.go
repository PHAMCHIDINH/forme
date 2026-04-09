package journal

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

const (
	testJournalDatabaseName = "personal_tasks_v2_journal_test"
	testJournalDatabaseURL   = "postgres://goclaw:05b23c710055bce2147f4f58a84cd252@localhost:5432/" + testJournalDatabaseName + "?sslmode=disable"
	adminJournalDatabaseURL  = "postgres://goclaw:05b23c710055bce2147f4f58a84cd252@localhost:5432/goclaw?sslmode=disable"
)

func TestMain(m *testing.M) {
	if err := prepareJournalRepositoryTestDatabase(); err != nil {
		fmt.Fprintf(os.Stderr, "prepare test database: %v\n", err)
		os.Exit(1)
	}

	code := m.Run()
	os.Exit(code)
}

func TestRepositoryListReturnsEntriesInConsumedOrder(t *testing.T) {
	repo, dbConn := newJournalTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndJournalEntries(t, dbConn, []journalSeed{
		{
			ID:         "11111111-1111-1111-1111-111111111111",
			Type:       "book",
			Title:      "Older book",
			ConsumedOn: mustDate(t, "2026-04-01"),
			CreatedAt:  mustTime(t, "2026-04-01T08:00:00Z"),
			UpdatedAt:  mustTime(t, "2026-04-01T08:00:00Z"),
		},
		{
			ID:         "22222222-2222-2222-2222-222222222222",
			Type:       "video",
			Title:      "Newer video",
			ConsumedOn: mustDate(t, "2026-04-03"),
			CreatedAt:  mustTime(t, "2026-04-03T09:00:00Z"),
			UpdatedAt:  mustTime(t, "2026-04-03T09:00:00Z"),
		},
		{
			ID:         "33333333-3333-3333-3333-333333333333",
			Type:       "book",
			Title:      "Same day newer created",
			ConsumedOn: mustDate(t, "2026-04-03"),
			CreatedAt:  mustTime(t, "2026-04-03T10:00:00Z"),
			UpdatedAt:  mustTime(t, "2026-04-03T10:00:00Z"),
		},
	})

	got, err := repo.List(ctx, ownerID)
	if err != nil {
		t.Fatalf("expected list to succeed, got error: %v", err)
	}

	if len(got) != 3 {
		t.Fatalf("expected 3 entries, got %d: %#v", len(got), got)
	}
	if got[0].ID != "33333333-3333-3333-3333-333333333333" || got[1].ID != "22222222-2222-2222-2222-222222222222" || got[2].ID != "11111111-1111-1111-1111-111111111111" {
		t.Fatalf("unexpected list order: %#v", got)
	}
}

func TestRepositoryCreatePersistsRichFields(t *testing.T) {
	repo, dbConn := newJournalTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndJournalEntries(t, dbConn, nil)
	imageURL := "https://example.com/cover.jpg"
	sourceURL := "https://example.com/watch"
	review := "Worth it"
	consumedOn := DateOnlyFromTime(time.Date(2026, 4, 4, 16, 30, 0, 0, time.UTC))

	got, err := repo.Create(ctx, ownerID, CreateParams{
		Type:       EntryTypeVideo,
		Title:      "Watch later",
		ImageURL:   &imageURL,
		SourceURL:  &sourceURL,
		Review:     &review,
		ConsumedOn: consumedOn,
	})
	if err != nil {
		t.Fatalf("expected create to succeed, got error: %v", err)
	}

	row := mustLoadJournalRow(t, dbConn, got.ID)
	if row.Type != "video" || row.Title != "Watch later" {
		t.Fatalf("unexpected journal row: %#v", row)
	}
	if row.ImageURL == nil || *row.ImageURL != imageURL {
		t.Fatalf("expected image URL to persist, got %#v", row.ImageURL)
	}
	if row.SourceURL == nil || *row.SourceURL != sourceURL {
		t.Fatalf("expected source URL to persist, got %#v", row.SourceURL)
	}
	if row.Review == nil || *row.Review != review {
		t.Fatalf("expected review to persist, got %#v", row.Review)
	}
	if row.ConsumedOn != "2026-04-04" {
		t.Fatalf("expected consumed_on to persist as a date, got %#v", row.ConsumedOn)
	}
}

func TestRepositoryUpdateMergesFieldsAndClearsOptionalValues(t *testing.T) {
	repo, dbConn := newJournalTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndJournalEntries(t, dbConn, []journalSeed{
		{
			ID:         "44444444-4444-4444-4444-444444444444",
			Type:       "book",
			Title:      "Original title",
			ImageURL:   stringPtr("https://example.com/original.jpg"),
			SourceURL:  stringPtr("https://example.com/original"),
			Review:     stringPtr("Original review"),
			ConsumedOn: mustDate(t, "2026-04-01"),
			CreatedAt:  mustTime(t, "2026-04-01T10:00:00Z"),
			UpdatedAt:  mustTime(t, "2026-04-01T10:00:00Z"),
		},
	})

	updated, err := repo.Update(ctx, ownerID, "44444444-4444-4444-4444-444444444444", UpdateParams{
		Type:       NewPatchValue(EntryTypeVideo),
		Title:      NewPatchValue("Updated title"),
		ImageURL:   NewPatchNull[string](),
		SourceURL:  NewPatchValue("https://example.com/new-source"),
		Review:     NewPatchNull[string](),
		ConsumedOn: NewPatchValue(DateOnlyFromTime(time.Date(2026, 4, 5, 13, 0, 0, 0, time.UTC))),
	})
	if err != nil {
		t.Fatalf("expected update to succeed, got error: %v", err)
	}

	row := mustLoadJournalRow(t, dbConn, updated.ID)
	if row.Type != "video" || row.Title != "Updated title" {
		t.Fatalf("unexpected updated row: %#v", row)
	}
	if row.ImageURL != nil {
		t.Fatalf("expected image URL to clear, got %#v", row.ImageURL)
	}
	if row.SourceURL == nil || *row.SourceURL != "https://example.com/new-source" {
		t.Fatalf("expected source URL to update, got %#v", row.SourceURL)
	}
	if row.Review != nil {
		t.Fatalf("expected review to clear, got %#v", row.Review)
	}
	if row.ConsumedOn != "2026-04-05" {
		t.Fatalf("expected consumed_on to update, got %#v", row.ConsumedOn)
	}
}

func TestRepositoryDeleteRemovesEntry(t *testing.T) {
	repo, dbConn := newJournalTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndJournalEntries(t, dbConn, []journalSeed{
		{
			ID:         "55555555-5555-5555-5555-555555555555",
			Type:       "book",
			Title:      "Delete me",
			ConsumedOn: mustDate(t, "2026-04-01"),
		},
	})

	if err := repo.Delete(ctx, ownerID, "55555555-5555-5555-5555-555555555555"); err != nil {
		t.Fatalf("expected delete to succeed, got error: %v", err)
	}

	if err := repo.Delete(ctx, ownerID, "55555555-5555-5555-5555-555555555555"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected missing delete to return not found, got %v", err)
	}
}

func prepareJournalRepositoryTestDatabase() error {
	adminDB, err := sql.Open("pgx", adminJournalDatabaseURL)
	if err != nil {
		return err
	}
	defer adminDB.Close()

	if _, err := adminDB.Exec(`DROP DATABASE IF EXISTS ` + testJournalDatabaseName + ` WITH (FORCE)`); err != nil {
		return err
	}
	if _, err := adminDB.Exec(`CREATE DATABASE ` + testJournalDatabaseName); err != nil {
		return err
	}

	testDB, err := sql.Open("pgx", testJournalDatabaseURL)
	if err != nil {
		return err
	}
	defer testDB.Close()

	goose.SetDialect("postgres")
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		return fmt.Errorf("runtime.Caller failed")
	}
	migrationsDir := filepath.Clean(filepath.Join(filepath.Dir(thisFile), "..", "..", "..", "db", "migrations"))
	return goose.Up(testDB, migrationsDir)
}

func newJournalTestRepository(t *testing.T) (*Repository, *sql.DB) {
	t.Helper()
	ctx := context.Background()

	conn, err := sql.Open("pgx", testJournalDatabaseURL)
	if err != nil {
		t.Fatalf("open test database: %v", err)
	}
	t.Cleanup(func() {
		_ = conn.Close()
	})

	if _, err := conn.ExecContext(ctx, `TRUNCATE TABLE journal_entries, todos, owners RESTART IDENTITY CASCADE`); err != nil {
		t.Fatalf("reset test database: %v", err)
	}

	pool, err := pgxpool.New(ctx, testJournalDatabaseURL)
	if err != nil {
		t.Fatalf("open pgx pool: %v", err)
	}
	t.Cleanup(pool.Close)

	return NewRepository(db.New(pool)), conn
}

func seedOwnerAndJournalEntries(t *testing.T, conn *sql.DB, seeds []journalSeed) string {
	t.Helper()

	ownerID := "owner-" + t.Name()
	ctx := context.Background()
	if _, err := conn.ExecContext(ctx, `
		INSERT INTO owners (id, username, password_hash, display_name)
		VALUES ($1, $2, $3, $4)
	`, ownerID, ownerID+"@example.com", "hash", "Owner"); err != nil {
		t.Fatalf("seed owner: %v", err)
	}

	for _, seed := range seeds {
		if seed.CreatedAt == nil {
			now := time.Now().UTC()
			seed.CreatedAt = &now
		}
		if seed.UpdatedAt == nil {
			seed.UpdatedAt = seed.CreatedAt
		}
		if _, err := conn.ExecContext(ctx, `
			INSERT INTO journal_entries (
				id, owner_id, type, title, image_url, source_url, review, consumed_on, created_at, updated_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, seed.ID, ownerID, seed.Type, seed.Title, seed.ImageURL, seed.SourceURL, seed.Review, seed.ConsumedOn, seed.CreatedAt, seed.UpdatedAt); err != nil {
			t.Fatalf("seed journal entry %s: %v", seed.ID, err)
		}
	}

	return ownerID
}

type journalSeed struct {
	ID         string
	Type       string
	Title      string
	ImageURL   *string
	SourceURL  *string
	Review     *string
	ConsumedOn time.Time
	CreatedAt  *time.Time
	UpdatedAt  *time.Time
}

type journalDBRow struct {
	Type       string
	Title      string
	ImageURL   *string
	SourceURL  *string
	Review     *string
	ConsumedOn string
}

func mustLoadJournalRow(t *testing.T, dbConn *sql.DB, id string) journalDBRow {
	t.Helper()

	var row journalDBRow
	var imageURL, sourceURL, review sql.NullString
	if err := dbConn.QueryRowContext(context.Background(), `
		SELECT type, title, image_url, source_url, review, to_char(consumed_on, 'YYYY-MM-DD')
		FROM journal_entries
		WHERE id = $1
	`, id).Scan(
		&row.Type,
		&row.Title,
		&imageURL,
		&sourceURL,
		&review,
		&row.ConsumedOn,
	); err != nil {
		t.Fatalf("load journal row %s: %v", id, err)
	}

	if imageURL.Valid {
		row.ImageURL = stringPtrValue(imageURL.String)
	}
	if sourceURL.Valid {
		row.SourceURL = stringPtrValue(sourceURL.String)
	}
	if review.Valid {
		row.Review = stringPtrValue(review.String)
	}

	return row
}

func mustDate(t *testing.T, value string) time.Time {
	t.Helper()

	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		t.Fatalf("parse date %q: %v", value, err)
	}
	return parsed.UTC()
}

func mustTime(t *testing.T, value string) *time.Time {
	t.Helper()

	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		t.Fatalf("parse time %q: %v", value, err)
	}
	return &parsed
}

func stringPtrValue(value string) *string {
	clone := value
	return &clone
}
