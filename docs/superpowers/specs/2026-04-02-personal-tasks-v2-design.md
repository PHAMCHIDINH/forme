# Personal Tasks v2 Design Spec

## 1. Status

This spec defines the approved design direction for Personal Tasks v2 as of
April 2, 2026.

It replaces the MVP 1 todo-only model for this workstream. The approved
direction is:

- evolve the existing `/api/v1/todos` product surface instead of rewriting it
- ship full v2 MVP in phased slices, but on one stable domain model
- treat board view as part of MVP, without drag-drop
- keep backend and storage semantics ahead of UI polish

## 2. Purpose

The goal is to turn the current authenticated todo CRUD into a personal task
manager that supports richer planning, execution, and cleanup flows without
introducing unnecessary product surface.

The MVP must let one user:

- capture tasks with richer metadata
- work from system views such as Today and Overdue
- search across task content
- manage completed and archived tasks distinctly
- switch between list and board views over the same dataset

The MVP must not include recurring tasks, reminders, sub-tasks, bulk actions,
or drag-drop board movement.

## 3. Current Project Context

The repo already contains:

- a Go backend in `chidinh_api`
- a React frontend in `chidinh_client`
- authenticated todo CRUD under `/api/v1/todos`
- a database model with `title` and `completed` only

Current code is tightly coupled to the binary todo model across migration,
sqlc queries, service types, HTTP handlers, client API types, and
`/app/todo` UI. The main implementation risk is not rendering complexity. The
main risk is domain-model churn if backend, frontend, and migration semantics
diverge.

## 4. Product Model

### 4.1 Resource Identity

The product continues to use the existing `/api/v1/todos` route family for MVP
2. The user-facing language may shift from "Todo" to "Personal Tasks", but the
transport boundary stays stable to reduce routing and deployment churn.

### 4.2 Canonical Task Shape

Each task must expose:

- `id`
- `title`
- `descriptionHtml`
- `status`
- `priority`
- `dueAt`
- `tags`
- `completedAt`
- `archivedAt`
- `createdAt`
- `updatedAt`

### 4.3 Enums

Allowed `status` values:

- `todo`
- `in_progress`
- `done`
- `cancelled`

Allowed `priority` values:

- `low`
- `medium`
- `high`

## 5. Domain Rules

### 5.1 Completion and Archive Semantics

Completion and archive are separate concerns.

- `status = done` means the work is finished
- `completedAt` is set when a task enters `done`
- leaving `done` clears `completedAt`
- `archivedAt` marks the task as hidden from active day-to-day views
- archived tasks may be `done` or `cancelled`

Completed tasks remain visible in the `Completed` view until archived. Archive
is the hygiene action, not the completion action.

### 5.2 Active Views

Active workspace views exclude archived tasks by default.

- `All active` includes non-archived tasks except `done` and `cancelled`
- `Today` includes non-archived tasks due on the current app-local day
- `Upcoming` includes non-archived tasks due after today
- `Overdue` includes non-archived tasks due before now and not `done`
- `Completed` includes non-archived tasks with `status = done`
- `Archived` includes tasks where `archivedAt` is set

`cancelled` tasks are not considered completed. They remain outside active
working views unless explicitly surfaced by filters or archived view behavior.

### 5.3 Timezone Rule

The app uses one fixed business timezone for all date semantics:

- `Asia/Ho_Chi_Minh`

Storage rules:

- `dueAt` is stored in UTC
- server-side derived views convert `dueAt` into `Asia/Ho_Chi_Minh` for date
  classification

Behavior rules:

- a task due later today is in `Today`, not `Overdue`
- `Upcoming` starts at the next local day boundary
- tasks with no `dueAt` are excluded from Today, Upcoming, and Overdue

### 5.4 Description Rule

The task description uses lightweight rich text. MVP supports basic emphasis
and list formatting only. It is not a block editor.

Persistence rule:

- frontend edits rich text
- backend stores sanitized HTML in `descriptionHtml`

### 5.5 Tags Rule

Tags are freeform values persisted on the task itself.

- users may enter arbitrary tags
- the system trims whitespace
- duplicate tags are removed case-insensitively
- the stored tag display value preserves the normalized form chosen by the app

The frontend also provides a fixed suggestion list stored in the client code.
Suggested tags do not limit what the user can enter.

## 6. Storage Design

### 6.1 Table Strategy

The existing `todos` table is upgraded in place. MVP does not create a new task
table and does not keep a long-lived compatibility model.

### 6.2 Required Columns

The upgraded table must contain:

- existing: `id`, `owner_id`, `title`, `created_at`, `updated_at`
- new: `description_html`, `status`, `priority`, `due_at`, `tags`,
  `completed_at`, `archived_at`

The old `completed` column is transitional only and should be removed after the
application fully reads from the new model.

### 6.3 Migration and Backfill

Backfill rules:

- `completed = false` -> `status = 'todo'`, `completed_at = NULL`
- `completed = true` -> `status = 'done'`, `completed_at = updated_at`
- `description_html = ''`
- `priority = 'medium'`
- `tags = '{}'`
- `archived_at = NULL`

Migration must preserve all existing rows and avoid making old records
unexpectedly disappear from the UI.

### 6.4 Indexing

The MVP schema should support:

- owner-scoped active list queries
- owner-scoped status and due-date filters
- tag membership lookup

Recommended index direction:

- composite btree on owner, archive state, status, and due date
- GIN index for `tags`

Search may start with simple SQL matching on title, description, and tags. Full
text indexing is not required for MVP unless basic query performance proves
insufficient.

## 7. API Design

### 7.1 List Endpoint

`GET /api/v1/todos` remains the primary collection endpoint and becomes the
source of truth for both list and board views.

The endpoint must support query parameters for:

- system view
- search text
- optional status filter
- optional tag filter

Recommended query contract:

- `view=active|today|upcoming|overdue|completed|archived`
- `q=<search text>`
- `status=<enum>`
- `tag=<normalized tag>`

The backend owns derived view semantics. The frontend must not re-implement
Today, Upcoming, Overdue, Completed, or Archived rules from raw data alone.

### 7.2 Create and Update

`POST /api/v1/todos` creates tasks with any subset of mutable fields that have
defaults.

`PATCH /api/v1/todos/:id` supports partial updates for:

- `title`
- `descriptionHtml`
- `status`
- `priority`
- `dueAt`
- `tags`
- `archivedAt`

The backend applies invariant logic when status changes. Clients do not set
`completedAt` directly.

### 7.3 Delete

Hard delete remains available for MVP. Archive is the primary task-hygiene
action in normal UX, but delete still exists as a destructive fallback.

## 8. Frontend Design

### 8.1 Route and Naming

The current `/app/todo` route remains in place for MVP. The screen should be
presented as Personal Tasks rather than a basic todo list.

### 8.2 Page Structure

The v2 task surface contains:

- header and summary metrics
- system-view navigation
- search control
- view toggle between list and board
- task creation entry point
- task detail and edit surface

### 8.3 List View

List view is the primary work surface.

Each task row or card should show:

- title
- status
- priority
- due date if present
- tags
- archive state where relevant

List mode must support all daily workflows without requiring board mode.

### 8.4 Board View

Board mode is grouped by status using four columns:

- `todo`
- `in_progress`
- `done`
- `cancelled`

Board mode uses the same backend filters and search semantics as list mode.
MVP status changes happen through click, menu, or select interactions. Drag-drop
is explicitly out of scope.

### 8.5 Description Editing

The frontend uses a lightweight rich-text editor with only basic formatting
controls needed for MVP. It must not introduce block-based composition,
embeds, or nested content models.

### 8.6 Tag Suggestions

The frontend ships a fixed suggestion list from client code. It should support:

- selecting a suggested tag
- entering an arbitrary tag
- removing tags from the task

This suggestion list is a UX aid, not a backend-managed taxonomy.

## 9. Testing Strategy

### 9.1 Backend

Required backend coverage:

- migration and backfill tests
- service-level tests for status, completion, archive, and tag invariants
- handler tests for list views, search, create, patch, archive, and delete
- repository or query tests for due-date and archive filtering behavior

### 9.2 Frontend

Required frontend coverage:

- list-view loading, empty, and error states
- create and edit task flows
- system-view navigation
- search behavior
- archive and unarchive flows
- board rendering and board/list parity

### 9.3 Verification Rule

Implementation is complete only when:

- backend tests pass
- frontend tests pass
- build steps pass
- smoke flows cover list and board against the real API contract

## 10. Delivery Shape

The approved delivery shape is backend-first on a single v2 model:

1. lock domain rules
2. migrate schema and data
3. upgrade backend contracts and query logic
4. replace list UI with v2 task UX
5. add board view on top of the same contracts
6. harden release and smoke-test migration-sensitive behavior

This order is mandatory for MVP because the current codebase is still centered
on the old `completed` boolean model.
