package todo

import (
	"context"
	"database/sql"
	"encoding/json"
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
	testDatabaseName = "personal_tasks_v2_test"
	testDatabaseURL  = "postgres://goclaw:05b23c710055bce2147f4f58a84cd252@localhost:5432/" + testDatabaseName + "?sslmode=disable"
	adminDatabaseURL = "postgres://goclaw:05b23c710055bce2147f4f58a84cd252@localhost:5432/goclaw?sslmode=disable"
)

func TestMain(m *testing.M) {
	if err := prepareRepositoryTestDatabase(); err != nil {
		fmt.Fprintf(os.Stderr, "prepare test database: %v\n", err)
		os.Exit(1)
	}

	code := m.Run()
	os.Exit(code)
}

func TestListWithOptionsActiveViewExcludesDoneCancelledAndArchived(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndTodos(t, dbConn, []todoSeed{
		{
			ID:          "11111111-1111-1111-1111-111111111111",
			Title:       "Draft spec",
			Description: "<p>launch blockers</p>",
			Status:      "todo",
			Priority:    "medium",
			Tags:        []string{"work"},
			DueAt:       mustTime(t, "2026-04-02T09:00:00Z"),
			CreatedAt:   mustTime(t, "2026-04-01T09:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T09:00:00Z"),
		},
		{
			ID:        "22222222-2222-2222-2222-222222222222",
			Title:     "Review notes",
			Status:    "in_progress",
			Priority:  "high",
			Tags:      []string{"focus"},
			DueAt:     mustTime(t, "2026-04-02T08:00:00Z"),
			CreatedAt: mustTime(t, "2026-04-01T10:00:00Z"),
			UpdatedAt: mustTime(t, "2026-04-01T10:00:00Z"),
		},
		{
			ID:          "33333333-3333-3333-3333-333333333333",
			Title:       "Completed work",
			Status:      "done",
			Priority:    "medium",
			CompletedAt: mustTime(t, "2026-04-01T12:00:00Z"),
			Tags:        []string{"work"},
			DueAt:       mustTime(t, "2026-04-01T11:30:00Z"),
			CreatedAt:   mustTime(t, "2026-04-01T11:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T12:00:00Z"),
		},
		{
			ID:        "44444444-4444-4444-4444-444444444444",
			Title:     "Cancelled work",
			Status:    "cancelled",
			Priority:  "low",
			Tags:      []string{"ops"},
			CreatedAt: mustTime(t, "2026-04-01T08:00:00Z"),
			UpdatedAt: mustTime(t, "2026-04-01T08:30:00Z"),
		},
		{
			ID:          "55555555-5555-5555-5555-555555555555",
			Title:       "Archived work",
			Status:      "done",
			Priority:    "low",
			ArchivedAt:  mustTime(t, "2026-04-01T13:00:00Z"),
			CompletedAt: mustTime(t, "2026-04-01T12:30:00Z"),
			Tags:        []string{"archive"},
			CreatedAt:   mustTime(t, "2026-04-01T07:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T13:00:00Z"),
		},
	})

	got, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "active"})
	if err != nil {
		t.Fatalf("expected active list to succeed, got error: %v", err)
	}

	if len(got) != 2 {
		t.Fatalf("expected 2 active tasks, got %d: %#v", len(got), got)
	}
	if got[0].ID != "22222222-2222-2222-2222-222222222222" || got[0].Status != StatusInProgress {
		t.Fatalf("unexpected first active task: %#v", got[0])
	}
	if got[1].ID != "11111111-1111-1111-1111-111111111111" || got[1].Status != StatusTodo {
		t.Fatalf("unexpected second active task: %#v", got[1])
	}
}

func TestListWithOptionsCompletedViewReturnsOnlyNonArchivedDoneTasks(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndTodos(t, dbConn, []todoSeed{
		{
			ID:        "66666666-6666-6666-6666-666666666666",
			Title:     "Completed task",
			Status:    "done",
			Priority:  "medium",
			Tags:      []string{"work"},
			CreatedAt: mustTime(t, "2026-04-01T09:00:00Z"),
			UpdatedAt: mustTime(t, "2026-04-01T10:00:00Z"),
		},
		{
			ID:          "77777777-7777-7777-7777-777777777777",
			Title:       "Archived done task",
			Status:      "done",
			ArchivedAt:  mustTime(t, "2026-04-01T11:00:00Z"),
			CompletedAt: mustTime(t, "2026-04-01T10:30:00Z"),
			Tags:        []string{"archive"},
			CreatedAt:   mustTime(t, "2026-04-01T10:30:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T11:00:00Z"),
		},
		{
			ID:        "88888888-8888-8888-8888-888888888888",
			Title:     "Still in progress",
			Status:    "in_progress",
			Priority:  "high",
			Tags:      []string{"work"},
			CreatedAt: mustTime(t, "2026-04-01T08:00:00Z"),
			UpdatedAt: mustTime(t, "2026-04-01T08:30:00Z"),
		},
	})

	got, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "completed"})
	if err != nil {
		t.Fatalf("expected completed list to succeed, got error: %v", err)
	}

	if len(got) != 1 {
		t.Fatalf("expected 1 completed task, got %d: %#v", len(got), got)
	}
	if got[0].ID != "66666666-6666-6666-6666-666666666666" {
		t.Fatalf("unexpected completed task: %#v", got[0])
	}
	if got[0].Status != StatusDone {
		t.Fatalf("expected completed task to have done status, got %#v", got[0].Status)
	}
}

func TestListWithOptionsSearchAndTagFiltersMatchTitleDescriptionAndTags(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndTodos(t, dbConn, []todoSeed{
		{
			ID:          "99999999-9999-9999-9999-999999999999",
			Title:       "Launch checklist",
			Description: "<p>Prepare for release</p>",
			Status:      "todo",
			Tags:        []string{"work"},
			CreatedAt:   mustTime(t, "2026-04-01T07:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T07:00:00Z"),
		},
		{
			ID:          "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			Title:       "Draft spec",
			Description: "<p>launch blockers</p>",
			Status:      "todo",
			Tags:        []string{"review"},
			CreatedAt:   mustTime(t, "2026-04-01T08:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T08:00:00Z"),
		},
		{
			ID:        "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
			Title:     "Roadmap",
			Status:    "in_progress",
			Tags:      []string{"launch", "work"},
			CreatedAt: mustTime(t, "2026-04-01T09:00:00Z"),
			UpdatedAt: mustTime(t, "2026-04-01T09:00:00Z"),
		},
		{
			ID:        "cccccccc-cccc-cccc-cccc-cccccccccccc",
			Title:     "Misc",
			Status:    "todo",
			Tags:      []string{"ops"},
			CreatedAt: mustTime(t, "2026-04-01T10:00:00Z"),
			UpdatedAt: mustTime(t, "2026-04-01T10:00:00Z"),
		},
	})

	searchGot, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "active", Search: "launch"})
	if err != nil {
		t.Fatalf("expected search list to succeed, got error: %v", err)
	}
	if len(searchGot) != 3 {
		t.Fatalf("expected search to match 3 active tasks, got %d: %#v", len(searchGot), searchGot)
	}

	tagGot, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "active", Tag: "work"})
	if err != nil {
		t.Fatalf("expected tag list to succeed, got error: %v", err)
	}
	if len(tagGot) != 2 {
		t.Fatalf("expected tag filter to match 2 active tasks, got %d: %#v", len(tagGot), tagGot)
	}
}

func TestListWithOptionsTodayUpcomingOverdueUseBusinessDayBoundaries(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	now := time.Now().In(businessLocation)
	year, month, day := now.Date()

	ownerID := seedOwnerAndTodos(t, dbConn, []todoSeed{
		{
			ID:        "11111111-1111-1111-1111-111111111111",
			Title:     "Earlier today",
			Status:    "todo",
			Priority:  "medium",
			DueAt:     businessTime(t, year, month, day, 1, 0),
			CreatedAt: businessTime(t, year, month, day, 0, 0),
			UpdatedAt: businessTime(t, year, month, day, 0, 0),
		},
		{
			ID:        "22222222-2222-2222-2222-222222222222",
			Title:     "Later today",
			Status:    "todo",
			Priority:  "medium",
			DueAt:     businessTime(t, year, month, day, 23, 59),
			CreatedAt: businessTime(t, year, month, day, 0, 0),
			UpdatedAt: businessTime(t, year, month, day, 0, 0),
		},
		{
			ID:        "33333333-3333-3333-3333-333333333333",
			Title:     "Yesterday",
			Status:    "todo",
			Priority:  "medium",
			DueAt:     businessTime(t, year, month, day-1, 23, 59),
			CreatedAt: businessTime(t, year, month, day-1, 0, 0),
			UpdatedAt: businessTime(t, year, month, day-1, 0, 0),
		},
		{
			ID:        "44444444-4444-4444-4444-444444444444",
			Title:     "Tomorrow",
			Status:    "todo",
			Priority:  "medium",
			DueAt:     businessTime(t, year, month, day+1, 0, 1),
			CreatedAt: businessTime(t, year, month, day+1, 0, 0),
			UpdatedAt: businessTime(t, year, month, day+1, 0, 0),
		},
	})

	todayGot, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "today"})
	if err != nil {
		t.Fatalf("expected today list to succeed, got error: %v", err)
	}
	assertTodoIDs(t, todayGot, "11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222")

	upcomingGot, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "upcoming"})
	if err != nil {
		t.Fatalf("expected upcoming list to succeed, got error: %v", err)
	}
	assertTodoIDs(t, upcomingGot, "44444444-4444-4444-4444-444444444444")

	overdueGot, err := repo.ListWithOptions(ctx, ownerID, ListOptions{View: "overdue"})
	if err != nil {
		t.Fatalf("expected overdue list to succeed, got error: %v", err)
	}
	assertTodoIDs(t, overdueGot, "33333333-3333-3333-3333-333333333333")
}

func TestRepositoryCreateV2PersistsRichFields(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndTodos(t, dbConn, nil)

	dueAt := mustTimeValue(t, "2026-04-03T09:00:00Z")
	suppliedCompletedAt := mustTimeValue(t, "2026-04-03T10:00:00Z")
	archivedAt := mustTimeValue(t, "2026-04-04T11:00:00Z")
	got, err := repo.CreateV2(ctx, ownerID, CreateParams{
		Title:           "Ship release",
		DescriptionHtml: "<p>launch ready</p>",
		Status:          StatusDone,
		Priority:        PriorityHigh,
		DueAt:           &dueAt,
		Tags:            []string{"work", "release"},
		CompletedAt:     &suppliedCompletedAt,
		ArchivedAt:      &archivedAt,
	})
	if err != nil {
		t.Fatalf("expected create v2 to succeed, got error: %v", err)
	}

	row := mustLoadTodoRow(t, dbConn, got.ID)
	if row.Title != "Ship release" {
		t.Fatalf("expected title to persist, got %#v", row)
	}
	if row.DescriptionHTML != "<p>launch ready</p>" {
		t.Fatalf("expected description_html to persist, got %#v", row)
	}
	if row.Status != string(StatusDone) {
		t.Fatalf("expected status to persist, got %#v", row)
	}
	if row.Priority != string(PriorityHigh) {
		t.Fatalf("expected priority to persist, got %#v", row)
	}
	if row.DueAt == nil || !row.DueAt.Equal(dueAt) {
		t.Fatalf("expected due_at to persist, got %#v", row.DueAt)
	}
	if len(row.Tags) != 2 || row.Tags[0] != "work" || row.Tags[1] != "release" {
		t.Fatalf("expected tags to persist, got %#v", row.Tags)
	}
	if row.CompletedAt == nil {
		t.Fatal("expected completed_at to be server-managed")
	}
	if row.CompletedAt.Equal(suppliedCompletedAt) {
		t.Fatalf("expected completed_at to ignore caller input, got %#v", row.CompletedAt)
	}
	if row.ArchivedAt == nil || !row.ArchivedAt.Equal(archivedAt) {
		t.Fatalf("expected archived_at to persist, got %#v", row.ArchivedAt)
	}
}

func TestRepositoryUpdateV2PersistsRichFields(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	ownerID := seedOwnerAndTodos(t, dbConn, []todoSeed{
		{
			ID:          "dddddddd-dddd-dddd-dddd-dddddddddddd",
			Title:       "Draft spec",
			Description: "<p>draft</p>",
			Status:      "todo",
			Priority:    "medium",
			Tags:        []string{"work"},
			DueAt:       mustTime(t, "2026-04-02T08:00:00Z"),
			CreatedAt:   mustTime(t, "2026-04-01T08:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T08:00:00Z"),
		},
	})

	dueAt := mustTimeValue(t, "2026-04-05T12:00:00Z")
	suppliedCompletedAt := mustTimeValue(t, "2026-04-05T13:00:00Z")
	archivedAt := mustTimeValue(t, "2026-04-06T14:00:00Z")
	got, err := repo.UpdateV2(ctx, ownerID, "dddddddd-dddd-dddd-dddd-dddddddddddd", UpdateParams{
		Title:           NewPatchValue("Updated spec"),
		DescriptionHtml: NewPatchValue("<p>updated</p>"),
		Status:          NewPatchValue(StatusDone),
		Priority:        NewPatchValue(PriorityLow),
		DueAt:           NewPatchValue(dueAt),
		Tags:            NewPatchValue([]string{"release", "work"}),
		CompletedAt:     NewPatchValue(suppliedCompletedAt),
		ArchivedAt:      NewPatchValue(archivedAt),
	})
	if err != nil {
		t.Fatalf("expected update v2 to succeed, got error: %v", err)
	}

	row := mustLoadTodoRow(t, dbConn, got.ID)
	if row.Title != "Updated spec" {
		t.Fatalf("expected title to persist, got %#v", row)
	}
	if row.DescriptionHTML != "<p>updated</p>" {
		t.Fatalf("expected description_html to persist, got %#v", row)
	}
	if row.Status != string(StatusDone) {
		t.Fatalf("expected status to persist, got %#v", row)
	}
	if row.Priority != string(PriorityLow) {
		t.Fatalf("expected priority to persist, got %#v", row)
	}
	if row.DueAt == nil || !row.DueAt.Equal(dueAt) {
		t.Fatalf("expected due_at to persist, got %#v", row.DueAt)
	}
	if len(row.Tags) != 2 || row.Tags[0] != "release" || row.Tags[1] != "work" {
		t.Fatalf("expected tags to persist, got %#v", row.Tags)
	}
	if row.CompletedAt == nil {
		t.Fatal("expected completed_at to be server-managed")
	}
	if row.CompletedAt.Equal(suppliedCompletedAt) {
		t.Fatalf("expected completed_at to ignore caller input, got %#v", row.CompletedAt)
	}
	if row.ArchivedAt == nil || !row.ArchivedAt.Equal(archivedAt) {
		t.Fatalf("expected archived_at to persist, got %#v", row.ArchivedAt)
	}
}

func TestRepositoryUpdateTitleOnlyPreservesExistingV2State(t *testing.T) {
	repo, dbConn := newTestRepository(t)
	ctx := context.Background()
	doneCompletedAt := mustTime(t, "2026-04-01T12:00:00Z")
	ownerID := seedOwnerAndTodos(t, dbConn, []todoSeed{
		{
			ID:          "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
			Title:       "Done task",
			Description: "<p>done</p>",
			Status:      "done",
			Priority:    "high",
			DueAt:       mustTime(t, "2026-04-02T08:00:00Z"),
			Tags:        []string{"work", "launch"},
			CompletedAt: doneCompletedAt,
			CreatedAt:   mustTime(t, "2026-04-01T08:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T09:00:00Z"),
		},
		{
			ID:          "ffffffff-ffff-ffff-ffff-ffffffffffff",
			Title:       "In progress task",
			Description: "<p>progress</p>",
			Status:      "in_progress",
			Priority:    "medium",
			DueAt:       mustTime(t, "2026-04-03T08:00:00Z"),
			Tags:        []string{"focus"},
			CreatedAt:   mustTime(t, "2026-04-01T10:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T10:30:00Z"),
		},
		{
			ID:          "abababab-abab-abab-abab-abababababab",
			Title:       "Cancelled task",
			Description: "<p>cancelled</p>",
			Status:      "cancelled",
			Priority:    "low",
			DueAt:       mustTime(t, "2026-04-04T08:00:00Z"),
			Tags:        []string{"ops"},
			CreatedAt:   mustTime(t, "2026-04-01T11:00:00Z"),
			UpdatedAt:   mustTime(t, "2026-04-01T11:30:00Z"),
		},
	})

	tests := []struct {
		name            string
		id              string
		wantStatus      Status
		wantCompleted   bool
		wantCompletedAt *time.Time
	}{
		{
			name:            "done",
			id:              "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
			wantStatus:      StatusDone,
			wantCompleted:   true,
			wantCompletedAt: doneCompletedAt,
		},
		{
			name:          "in_progress",
			id:            "ffffffff-ffff-ffff-ffff-ffffffffffff",
			wantStatus:    StatusInProgress,
			wantCompleted: false,
		},
		{
			name:          "cancelled",
			id:            "abababab-abab-abab-abab-abababababab",
			wantStatus:    StatusCancelled,
			wantCompleted: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.Update(ctx, ownerID, tt.id, ptrString("Renamed "+tt.name), nil)
			if err != nil {
				t.Fatalf("expected title-only update to succeed, got error: %v", err)
			}

			row := mustLoadTodoRow(t, dbConn, tt.id)
			if row.Title != "Renamed "+tt.name {
				t.Fatalf("expected title to update, got %#v", row)
			}
			if row.Status != string(tt.wantStatus) {
				t.Fatalf("expected status %q to be preserved, got %#v", tt.wantStatus, row.Status)
			}
			if row.Completed != tt.wantCompleted {
				t.Fatalf("expected completed bool %v to be preserved, got %#v", tt.wantCompleted, row.Completed)
			}
			if tt.wantCompletedAt == nil {
				if row.CompletedAt != nil {
					t.Fatalf("expected completed_at to remain nil, got %#v", row.CompletedAt)
				}
			} else if row.CompletedAt == nil || !row.CompletedAt.Equal(*tt.wantCompletedAt) {
				t.Fatalf("expected completed_at to be preserved, got %#v", row.CompletedAt)
			}
			if row.DescriptionHTML == "" || row.Priority == "" || row.DueAt == nil || len(row.Tags) == 0 {
				t.Fatalf("expected richer state to be preserved, got %#v", row)
			}
			if got.Status != tt.wantStatus {
				t.Fatalf("expected returned status %q, got %#v", tt.wantStatus, got.Status)
			}
		})
	}
}

type todoSeed struct {
	ID          string
	Title       string
	Description string
	Status      string
	Priority    string
	DueAt       *time.Time
	Tags        []string
	CompletedAt *time.Time
	ArchivedAt  *time.Time
	CreatedAt   *time.Time
	UpdatedAt   *time.Time
}

func prepareRepositoryTestDatabase() error {
	adminDB, err := sql.Open("pgx", adminDatabaseURL)
	if err != nil {
		return err
	}
	defer adminDB.Close()

	if _, err := adminDB.Exec(`DROP DATABASE IF EXISTS ` + testDatabaseName + ` WITH (FORCE)`); err != nil {
		return err
	}
	if _, err := adminDB.Exec(`CREATE DATABASE ` + testDatabaseName); err != nil {
		return err
	}

	testDB, err := sql.Open("pgx", testDatabaseURL)
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

func newTestRepository(t *testing.T) (*Repository, *sql.DB) {
	t.Helper()
	ctx := context.Background()

	conn, err := sql.Open("pgx", testDatabaseURL)
	if err != nil {
		t.Fatalf("open test database: %v", err)
	}
	t.Cleanup(func() {
		_ = conn.Close()
	})

	if _, err := conn.ExecContext(ctx, `TRUNCATE TABLE todos, owners RESTART IDENTITY CASCADE`); err != nil {
		t.Fatalf("reset test database: %v", err)
	}

	pool, err := pgxpool.New(ctx, testDatabaseURL)
	if err != nil {
		t.Fatalf("open pgx pool: %v", err)
	}
	t.Cleanup(pool.Close)

	return NewRepository(db.New(pool)), conn
}

func seedOwnerAndTodos(t *testing.T, conn *sql.DB, seeds []todoSeed) string {
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
		if seed.Priority == "" {
			seed.Priority = "medium"
		}
		if seed.Tags == nil {
			seed.Tags = []string{}
		}
		if seed.CreatedAt == nil {
			now := time.Now().UTC()
			seed.CreatedAt = &now
		}
		if seed.UpdatedAt == nil {
			seed.UpdatedAt = seed.CreatedAt
		}
		if seed.DueAt == nil {
			seed.DueAt = nil
		}
		if _, err := conn.ExecContext(ctx, `
			INSERT INTO todos (
				id, owner_id, title, description_html, status, priority, due_at, tags,
				completed, completed_at, archived_at, created_at, updated_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`, seed.ID, ownerID, seed.Title, seed.Description, seed.Status, seed.Priority, seed.DueAt, seed.Tags, seed.Status == "done", seed.CompletedAt, seed.ArchivedAt, seed.CreatedAt, seed.UpdatedAt); err != nil {
			t.Fatalf("seed todo %s: %v", seed.ID, err)
		}
	}

	return ownerID
}

type todoDBRow struct {
	Title           string
	DescriptionHTML string
	Status          string
	Priority        string
	DueAt           *time.Time
	Tags            []string
	Completed       bool
	CompletedAt     *time.Time
	ArchivedAt      *time.Time
}

func mustLoadTodoRow(t *testing.T, dbConn *sql.DB, id string) todoDBRow {
	t.Helper()

	var row todoDBRow
	var dueAt, completedAt, archivedAt sql.NullTime
	var tagsJSON string
	err := dbConn.QueryRowContext(context.Background(), `
		SELECT title, description_html, status, priority, due_at, COALESCE(array_to_json(tags)::text, '[]'), completed, completed_at, archived_at
		FROM todos
		WHERE id = $1
	`, id).Scan(
		&row.Title,
		&row.DescriptionHTML,
		&row.Status,
		&row.Priority,
		&dueAt,
		&tagsJSON,
		&row.Completed,
		&completedAt,
		&archivedAt,
	)
	if err != nil {
		t.Fatalf("load todo row %s: %v", id, err)
	}

	if dueAt.Valid {
		value := dueAt.Time.UTC()
		row.DueAt = &value
	}
	if err := json.Unmarshal([]byte(tagsJSON), &row.Tags); err != nil {
		t.Fatalf("unmarshal todo tags %s: %v", id, err)
	}
	if completedAt.Valid {
		value := completedAt.Time.UTC()
		row.CompletedAt = &value
	}
	if archivedAt.Valid {
		value := archivedAt.Time.UTC()
		row.ArchivedAt = &value
	}

	return row
}

func mustTimeValue(t *testing.T, value string) time.Time {
	t.Helper()

	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		t.Fatalf("parse time %q: %v", value, err)
	}
	return parsed
}

func ptrString(value string) *string { return &value }

func mustTime(t *testing.T, value string) *time.Time {
	t.Helper()

	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		t.Fatalf("parse time %q: %v", value, err)
	}
	return &parsed
}

func businessTime(t *testing.T, year int, month time.Month, day, hour, min int) *time.Time {
	t.Helper()

	value := time.Date(year, month, day, hour, min, 0, 0, businessLocation)
	return &value
}

func assertTodoIDs(t *testing.T, got []Item, wantIDs ...string) {
	t.Helper()

	if len(got) != len(wantIDs) {
		t.Fatalf("expected %d todos, got %d: %#v", len(wantIDs), len(got), got)
	}

	gotIDs := make(map[string]struct{}, len(got))
	for _, item := range got {
		gotIDs[item.ID] = struct{}{}
	}
	for _, wantID := range wantIDs {
		if _, ok := gotIDs[wantID]; !ok {
			t.Fatalf("expected todo %s in result set, got %#v", wantID, got)
		}
	}
}
