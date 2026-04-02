# Personal Tasks v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current todo module into the approved Personal Tasks v2 MVP across Go backend, PostgreSQL schema, and React frontend while preserving the existing `/api/v1/todos` route family.

**Architecture:** Keep the current route boundaries, upgrade the `todos` table in place, and move the whole stack onto one canonical v2 task model. Backend owns task semantics for status, archive, date-derived views, and search. Frontend consumes that contract for both list and board mode, with list mode landing first in implementation order even though the final MVP includes board.

**Tech Stack:** Go 1.25, Chi, pgx/sqlc, Goose migrations, React 19, React Query, React Hook Form, Zod, Vitest, Testing Library

---

## File Structure

### Backend files to modify

- `chidinh_api/db/migrations/0001_init.sql`
- `chidinh_api/db/queries/todos.sql`
- `chidinh_api/db/sqlc/models.go`
- `chidinh_api/db/sqlc/todos.sql.go`
- `chidinh_api/internal/modules/todo/types.go`
- `chidinh_api/internal/modules/todo/service.go`
- `chidinh_api/internal/modules/todo/repository.go`
- `chidinh_api/internal/modules/todo/handler.go`
- `chidinh_api/internal/modules/todo/handler_test.go`

### Backend files to create

- `chidinh_api/db/migrations/0002_personal_tasks_v2.sql`
- `chidinh_api/internal/modules/todo/service_test.go`
- `chidinh_api/internal/modules/todo/repository_test.go`

### Frontend files to modify

- `chidinh_client/src/modules/todo/api.ts`
- `chidinh_client/src/modules/todo/TodoPage.tsx`
- `chidinh_client/src/app/router/AppRouter.tsx`
- `chidinh_client/src/test/todo.page.test.tsx`

### Frontend files to create

- `chidinh_client/src/modules/todo/taskTypes.ts`
- `chidinh_client/src/modules/todo/tagSuggestions.ts`
- `chidinh_client/src/modules/todo/taskDate.ts`
- `chidinh_client/src/modules/todo/TaskPage.tsx`
- `chidinh_client/src/modules/todo/TaskHeader.tsx`
- `chidinh_client/src/modules/todo/TaskFilters.tsx`
- `chidinh_client/src/modules/todo/TaskForm.tsx`
- `chidinh_client/src/modules/todo/TaskListView.tsx`
- `chidinh_client/src/modules/todo/TaskBoardView.tsx`
- `chidinh_client/src/modules/todo/TaskCard.tsx`
- `chidinh_client/src/modules/todo/TaskEditor.tsx`

## Task 1: Lock Backend Domain Model and Invariants

**Files:**
- Modify: `chidinh_api/internal/modules/todo/types.go`
- Modify: `chidinh_api/internal/modules/todo/service.go`
- Create: `chidinh_api/internal/modules/todo/service_test.go`

- [ ] **Step 1: Write the failing backend invariant tests**

```go
package todo

import (
	"context"
	"testing"
	"time"
)

type noopStore struct{}

func (noopStore) List(context.Context, string, ListOptions) ([]Item, error) { return nil, nil }
func (noopStore) Create(context.Context, string, CreateParams) (Item, error) { return Item{}, nil }
func (noopStore) Update(context.Context, string, string, UpdateParams) (Item, error) { return Item{}, nil }
func (noopStore) Delete(context.Context, string, string) error { return nil }

func TestNormalizeCreateParamsSetsDoneCompletionAndTags(t *testing.T) {
	svc := NewService(noopStore{})
	dueAt := time.Date(2026, 4, 2, 15, 0, 0, 0, time.UTC)

	params, err := svc.NormalizeCreateParams(CreateRequest{
		Title:           "  Ship v2  ",
		DescriptionHTML: "<p>Hello</p>",
		Status:          StatusDone,
		Priority:        PriorityHigh,
		DueAt:           &dueAt,
		Tags:            []string{" Work ", "work", "Launch"},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if params.Title != "Ship v2" {
		t.Fatalf("expected normalized title, got %q", params.Title)
	}
	if params.CompletedAt == nil {
		t.Fatal("expected completedAt for done task")
	}
	if len(params.Tags) != 2 || params.Tags[0] != "work" || params.Tags[1] != "launch" {
		t.Fatalf("unexpected tags: %#v", params.Tags)
	}
}

func TestNormalizeUpdateParamsClearsCompletedAtWhenLeavingDone(t *testing.T) {
	svc := NewService(noopStore{})
	status := StatusInProgress

	params, err := svc.NormalizeUpdateParams(UpdateRequest{
		Status: &status,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if params.Status == nil || *params.Status != StatusInProgress {
		t.Fatalf("unexpected status: %#v", params.Status)
	}
	if params.ClearCompletedAt == nil || !*params.ClearCompletedAt {
		t.Fatalf("expected completedAt clear flag, got %#v", params.ClearCompletedAt)
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/todo -run 'TestNormalize(Create|Update)Params'`

Expected: FAIL with missing v2 types or methods such as `ListOptions`, `CreateParams`, `StatusDone`, or `NormalizeCreateParams`.

- [ ] **Step 3: Write minimal domain model and normalization code**

```go
type Status string

const (
	StatusTodo       Status = "todo"
	StatusInProgress Status = "in_progress"
	StatusDone       Status = "done"
	StatusCancelled  Status = "cancelled"
)

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type Item struct {
	ID              string     `json:"id"`
	Title           string     `json:"title"`
	DescriptionHTML string     `json:"descriptionHtml"`
	Status          Status     `json:"status"`
	Priority        Priority   `json:"priority"`
	DueAt           *time.Time `json:"dueAt"`
	Tags            []string   `json:"tags"`
	CompletedAt     *time.Time `json:"completedAt"`
	ArchivedAt      *time.Time `json:"archivedAt"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type CreateParams struct {
	Title           string
	DescriptionHTML string
	Status          Status
	Priority        Priority
	DueAt           *time.Time
	Tags            []string
	CompletedAt     *time.Time
}

type UpdateParams struct {
	Title            *string
	DescriptionHTML  *string
	Status           *Status
	Priority         *Priority
	DueAt            *time.Time
	ClearDueAt       bool
	Tags             []string
	ReplaceTags      bool
	ArchivedAt       *time.Time
	ClearArchivedAt  bool
	ClearCompletedAt *bool
}
```

```go
func (s *Service) NormalizeCreateParams(req CreateRequest) (CreateParams, error) {
	now := time.Now().UTC()
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return CreateParams{}, fmt.Errorf("title is required")
	}

	status := req.Status
	if status == "" {
		status = StatusTodo
	}
	priority := req.Priority
	if priority == "" {
		priority = PriorityMedium
	}

	params := CreateParams{
		Title:           title,
		DescriptionHTML: strings.TrimSpace(req.DescriptionHTML),
		Status:          status,
		Priority:        priority,
		DueAt:           req.DueAt,
		Tags:            normalizeTags(req.Tags),
	}
	if status == StatusDone {
		params.CompletedAt = &now
	}
	return params, nil
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/todo -run 'TestNormalize(Create|Update)Params'`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api/internal/modules/todo/types.go chidinh_api/internal/modules/todo/service.go chidinh_api/internal/modules/todo/service_test.go
git commit -m "feat: define personal tasks v2 domain rules"
```

## Task 2: Add Schema Migration and sqlc Query Shape

**Files:**
- Create: `chidinh_api/db/migrations/0002_personal_tasks_v2.sql`
- Modify: `chidinh_api/db/queries/todos.sql`
- Modify: `chidinh_api/db/sqlc/models.go`
- Modify: `chidinh_api/db/sqlc/todos.sql.go`
- Create: `chidinh_api/internal/modules/todo/repository_test.go`

- [ ] **Step 1: Write the failing repository query test**

```go
func TestListByViewFiltersArchivedAndCompletedRecords(t *testing.T) {
	t.Parallel()

	// Seed rows covering active, done, cancelled, archived, and overdue tasks.
	// Then assert view=active excludes done/cancelled/archived while
	// view=completed returns only non-archived done tasks.
}
```

Add the concrete assertions once the helper database harness is in place:

```go
if len(active) != 2 {
	t.Fatalf("expected 2 active tasks, got %d", len(active))
}
if active[0].Status != StatusTodo || active[1].Status != StatusInProgress {
	t.Fatalf("unexpected active rows: %#v", active)
}
if len(completed) != 1 || completed[0].Status != StatusDone {
	t.Fatalf("unexpected completed rows: %#v", completed)
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/todo -run TestListByViewFiltersArchivedAndCompletedRecords`

Expected: FAIL because the schema, query params, and repository filter support do not exist yet.

- [ ] **Step 3: Write the migration and query changes**

```sql
-- +goose Up
ALTER TABLE todos
    ADD COLUMN description_html TEXT NOT NULL DEFAULT '',
    ADD COLUMN status TEXT NOT NULL DEFAULT 'todo',
    ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium',
    ADD COLUMN due_at TIMESTAMPTZ NULL,
    ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN completed_at TIMESTAMPTZ NULL,
    ADD COLUMN archived_at TIMESTAMPTZ NULL;

UPDATE todos
SET status = CASE WHEN completed THEN 'done' ELSE 'todo' END,
    completed_at = CASE WHEN completed THEN updated_at ELSE NULL END;

CREATE INDEX IF NOT EXISTS idx_todos_owner_archive_status_due
    ON todos (owner_id, archived_at, status, due_at);

CREATE INDEX IF NOT EXISTS idx_todos_tags_gin
    ON todos USING GIN (tags);
```

```sql
-- name: ListTodosByOwner :many
SELECT id, owner_id, title, description_html, status, priority, due_at, tags,
       completed_at, archived_at, created_at, updated_at
FROM todos
WHERE owner_id = sqlc.arg(owner_id)
  AND (
    sqlc.arg(view_name)::text = ''
    OR (
      sqlc.arg(view_name)::text = 'active'
      AND archived_at IS NULL
      AND status IN ('todo', 'in_progress')
    )
    OR (
      sqlc.arg(view_name)::text = 'completed'
      AND archived_at IS NULL
      AND status = 'done'
    )
  )
ORDER BY COALESCE(due_at, created_at) ASC, created_at DESC;
```

After editing SQL, regenerate sqlc:

```bash
cd /mnt/d/chidinh/chidinh_api
sqlc generate
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/todo -run TestListByViewFiltersArchivedAndCompletedRecords`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api/db/migrations/0002_personal_tasks_v2.sql chidinh_api/db/queries/todos.sql chidinh_api/db/sqlc/models.go chidinh_api/db/sqlc/todos.sql.go chidinh_api/internal/modules/todo/repository_test.go
git commit -m "feat: migrate todos storage to personal tasks v2"
```

## Task 3: Upgrade HTTP Handlers and Backend Contract

**Files:**
- Modify: `chidinh_api/internal/modules/todo/handler.go`
- Modify: `chidinh_api/internal/modules/todo/service.go`
- Modify: `chidinh_api/internal/modules/todo/repository.go`
- Modify: `chidinh_api/internal/modules/todo/handler_test.go`

- [ ] **Step 1: Write the failing HTTP contract tests**

Add handler tests for:

```go
func TestListReturnsTodayViewResultsOverHTTP(t *testing.T) {}
func TestCreateAcceptsRichTaskPayloadOverHTTP(t *testing.T) {}
func TestPatchArchivesTaskOverHTTP(t *testing.T) {}
func TestPatchStatusToDoneSetsCompletedAtOverHTTP(t *testing.T) {}
```

Use a concrete create payload:

```json
{
  "title": "Review launch plan",
  "descriptionHtml": "<p>Check blockers</p>",
  "status": "in_progress",
  "priority": "high",
  "dueAt": "2026-04-03T02:00:00.000Z",
  "tags": ["work", "launch"]
}
```

Assert response fields:

```go
if resp.Data.Item.Status != todo.StatusInProgress {
	t.Fatalf("expected status %q, got %q", todo.StatusInProgress, resp.Data.Item.Status)
}
if resp.Data.Item.Priority != todo.PriorityHigh {
	t.Fatalf("expected priority %q, got %q", todo.PriorityHigh, resp.Data.Item.Priority)
}
if len(resp.Data.Item.Tags) != 2 {
	t.Fatalf("expected tags in response, got %#v", resp.Data.Item.Tags)
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/todo -run 'Test(ListReturnsTodayViewResultsOverHTTP|CreateAcceptsRichTaskPayloadOverHTTP|Patch(StatusToDoneSetsCompletedAt|ArchivesTask)OverHTTP)'`

Expected: FAIL because request parsing, query params, and response shape are still v1.

- [ ] **Step 3: Write minimal handler, service, and repository changes**

```go
type ListOptions struct {
	View string
	Q    string
	Tag  string
	Status *Status
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	opts, err := decodeListOptions(r)
	if err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	items, err := h.service.List(r.Context(), ownerID, opts)
	// unchanged response envelope
}
```

```go
func (s *Service) Update(ctx context.Context, ownerID string, todoID string, req UpdateRequest) (Item, error) {
	params, err := s.NormalizeUpdateParams(req)
	if err != nil {
		return Item{}, err
	}
	return s.repository.Update(ctx, ownerID, todoID, params)
}
```

```go
func (r *Repository) mapDBTodo(item db.Todo) Item {
	return Item{
		ID:              item.ID.String(),
		Title:           item.Title,
		DescriptionHTML: item.DescriptionHtml,
		Status:          Status(item.Status),
		Priority:        Priority(item.Priority),
		DueAt:           nullableTime(item.DueAt),
		Tags:            append([]string(nil), item.Tags...),
		CompletedAt:     nullableTime(item.CompletedAt),
		ArchivedAt:      nullableTime(item.ArchivedAt),
		CreatedAt:       item.CreatedAt.Time,
		UpdatedAt:       item.UpdatedAt.Time,
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/todo -run 'Test(ListReturnsTodayViewResultsOverHTTP|CreateAcceptsRichTaskPayloadOverHTTP|Patch(StatusToDoneSetsCompletedAt|ArchivesTask)OverHTTP)'`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api/internal/modules/todo/handler.go chidinh_api/internal/modules/todo/service.go chidinh_api/internal/modules/todo/repository.go chidinh_api/internal/modules/todo/handler_test.go
git commit -m "feat: expose personal tasks v2 api contract"
```

## Task 4: Add Client Task Types, API Filters, and List-First Tests

**Files:**
- Create: `chidinh_client/src/modules/todo/taskTypes.ts`
- Create: `chidinh_client/src/modules/todo/tagSuggestions.ts`
- Modify: `chidinh_client/src/modules/todo/api.ts`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`

- [ ] **Step 1: Write the failing frontend contract tests**

Add tests covering:

```tsx
it("loads the all active view by default", async () => {})
it("passes search and view filters to the todo api", async () => {})
it("renders task metadata returned by the api", async () => {})
```

Concrete response fixture:

```ts
{
  id: "task-1",
  title: "Review launch plan",
  descriptionHtml: "<p>Check blockers</p>",
  status: "in_progress",
  priority: "high",
  dueAt: "2026-04-03T02:00:00.000Z",
  tags: ["work", "launch"],
  completedAt: null,
  archivedAt: null,
  createdAt: "2026-04-02T10:00:00.000Z",
  updatedAt: "2026-04-02T10:00:00.000Z"
}
```

Filter assertion:

```ts
expect(new URL(String(fetchMock.mock.calls[2][0])).searchParams.get("view")).toBe("active");
expect(new URL(String(fetchMock.mock.calls[3][0])).searchParams.get("q")).toBe("launch");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: FAIL because the current page does not request or render v2 fields.

- [ ] **Step 3: Write the client-side model and API changes**

```ts
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export type TaskItem = {
  id: string;
  title: string;
  descriptionHtml: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  tags: string[];
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskListView = "active" | "today" | "upcoming" | "overdue" | "completed" | "archived";
```

```ts
export async function listTodos(params: { view: TaskListView; q?: string; status?: TaskStatus; tag?: string }) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", params.view);
  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.tag) searchParams.set("tag", params.tag);
  return apiRequest<{ items: TaskItem[] }>(`/api/v1/todos?${searchParams.toString()}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: PASS for the new contract-focused cases

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/todo/taskTypes.ts chidinh_client/src/modules/todo/tagSuggestions.ts chidinh_client/src/modules/todo/api.ts chidinh_client/src/test/todo.page.test.tsx
git commit -m "feat: add personal task client contract"
```

## Task 5: Implement List-First Personal Tasks UI

**Files:**
- Create: `chidinh_client/src/modules/todo/TaskPage.tsx`
- Create: `chidinh_client/src/modules/todo/TaskHeader.tsx`
- Create: `chidinh_client/src/modules/todo/TaskFilters.tsx`
- Create: `chidinh_client/src/modules/todo/TaskForm.tsx`
- Create: `chidinh_client/src/modules/todo/TaskListView.tsx`
- Create: `chidinh_client/src/modules/todo/TaskCard.tsx`
- Create: `chidinh_client/src/modules/todo/TaskEditor.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoPage.tsx`
- Modify: `chidinh_client/src/app/router/AppRouter.tsx`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`

- [ ] **Step 1: Write the failing list-first UI tests**

Add test cases for:

```tsx
it("creates a task with priority, due date, tags, and description", async () => {})
it("switches between system views and updates the heading", async () => {})
it("archives and unarchives a task", async () => {})
it("shows completed and archived tasks as visually distinct states", async () => {})
```

Concrete create assertion:

```ts
expect(readJsonBody(fetchMock.mock.calls[2][1])).toEqual({
  title: "Review launch plan",
  descriptionHtml: "<p>Check blockers</p>",
  status: "todo",
  priority: "high",
  dueAt: "2026-04-03T02:00:00.000Z",
  tags: ["work", "launch"],
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: FAIL because the existing page only supports title and completed checkbox interactions.

- [ ] **Step 3: Write the minimal list-first UI**

```tsx
export function TodoPage() {
  return <TaskPage />;
}
```

```tsx
export function TaskPage() {
  const [view, setView] = useState<TaskListView>("active");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"list" | "board">("list");

  const tasksQuery = useQuery({
    queryKey: ["todos", view, search],
    queryFn: () => listTodos({ view, q: search || undefined }),
  });

  return (
    <section className="space-y-6">
      <TaskHeader mode={mode} onModeChange={setMode} />
      <TaskFilters view={view} onViewChange={setView} search={search} onSearchChange={setSearch} />
      <TaskForm />
      {mode === "list" ? <TaskListView items={items} /> : <TaskBoardView items={items} />}
    </section>
  );
}
```

Implementation minimums:

- create/edit form with title, description, status, priority, due date, tags
- system-view controls
- search input
- archive and unarchive buttons
- status and priority badges
- completed and archived visual treatment

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/todo/TodoPage.tsx chidinh_client/src/modules/todo/TaskPage.tsx chidinh_client/src/modules/todo/TaskHeader.tsx chidinh_client/src/modules/todo/TaskFilters.tsx chidinh_client/src/modules/todo/TaskForm.tsx chidinh_client/src/modules/todo/TaskListView.tsx chidinh_client/src/modules/todo/TaskCard.tsx chidinh_client/src/modules/todo/TaskEditor.tsx chidinh_client/src/app/router/AppRouter.tsx chidinh_client/src/test/todo.page.test.tsx
git commit -m "feat: implement personal tasks list experience"
```

## Task 6: Add Board View and Board/List Parity Tests

**Files:**
- Create: `chidinh_client/src/modules/todo/TaskBoardView.tsx`
- Modify: `chidinh_client/src/modules/todo/TaskPage.tsx`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`

- [ ] **Step 1: Write the failing board tests**

Add tests for:

```tsx
it("groups tasks into board columns by status", async () => {})
it("changes task status from the board without drag and drop", async () => {})
it("applies active search and view filters in board mode", async () => {})
```

Board expectation:

```ts
expect(await screen.findByRole("heading", { name: /todo/i })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: /in progress/i })).toBeInTheDocument();
expect(screen.getByText("Review launch plan")).toBeInTheDocument();
```

Status update assertion:

```ts
expect(readJsonBody(fetchMock.mock.calls[3][1])).toMatchObject({ status: "done" });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: FAIL because board mode does not exist yet.

- [ ] **Step 3: Write the minimal board implementation**

```tsx
const BOARD_COLUMNS: TaskStatus[] = ["todo", "in_progress", "done", "cancelled"];

export function TaskBoardView({ items, onStatusChange }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {BOARD_COLUMNS.map((status) => (
        <Panel key={status} className="p-4">
          <h3>{labelForStatus(status)}</h3>
          <div className="mt-4 space-y-3">
            {items.filter((item) => item.status === status).map((item) => (
              <TaskCard key={item.id} item={item} onStatusChange={onStatusChange} />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/todo/TaskBoardView.tsx chidinh_client/src/modules/todo/TaskPage.tsx chidinh_client/src/test/todo.page.test.tsx
git commit -m "feat: add personal tasks board view"
```

## Task 7: Full-Stack Verification and Release Hardening

**Files:**
- Modify: `docs/project/2026-03-31-mvp1-local-runbook.md`
- Create: `docs/project/2026-04-02-personal-tasks-v2-smoke-checklist.md`

- [ ] **Step 1: Write the failing smoke checklist**

Create a checklist covering:

```md
- create a todo-style task with only a title
- create a rich task with description, due date, priority, and tags
- verify Today, Upcoming, Overdue, Completed, and Archived views
- verify board grouping and status changes
- verify archive/unarchive behavior
```

- [ ] **Step 2: Run automated verification before documentation updates**

Run:

```bash
cd /mnt/d/chidinh/chidinh_api && go test ./...
cd /mnt/d/chidinh/chidinh_client && npm test
cd /mnt/d/chidinh/chidinh_client && npm run build
```

Expected: any failures here block completion and must be fixed before finalizing docs.

- [ ] **Step 3: Update runbook and smoke guide**

Document the new API and UI checks, including:

```md
curl -fsS -b "$COOKIE_JAR" "$API/api/v1/todos?view=active"
curl -fsS -X POST "$API/api/v1/todos" -H "Content-Type: application/json" \
  -d '{"title":"Review launch plan","status":"todo","priority":"high","tags":["work"]}'
curl -fsS -X PATCH "$API/api/v1/todos/$ITEM_ID" -H "Content-Type: application/json" \
  -d '{"status":"done"}'
```

- [ ] **Step 4: Re-run full verification**

Run:

```bash
cd /mnt/d/chidinh/chidinh_api && go test ./...
cd /mnt/d/chidinh/chidinh_client && npm test
cd /mnt/d/chidinh/chidinh_client && npm run build
```

Expected: all commands exit 0

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh
git add docs/project/2026-03-31-mvp1-local-runbook.md docs/project/2026-04-02-personal-tasks-v2-smoke-checklist.md
git commit -m "docs: add personal tasks v2 verification guide"
```

## Self-Review

### Spec coverage

- task schema, migration, and backfill: covered by Tasks 1-3
- richer CRUD, views, search, archive semantics: covered by Tasks 3-5
- board without drag-drop: covered by Task 6
- regression and release verification: covered by Task 7

### Placeholder scan

- no `TBD`, `TODO`, or "implement later" placeholders remain
- optional implementation details are constrained to MVP-safe defaults

### Type consistency

- backend canonical names use `descriptionHtml`, `status`, `priority`, `dueAt`, `tags`, `completedAt`, `archivedAt`
- frontend uses the same transport names
- route family stays `/api/v1/todos`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-02-personal-tasks-v2.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
