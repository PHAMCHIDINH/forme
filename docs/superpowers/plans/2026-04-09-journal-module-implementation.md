# Journal Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new authenticated `Journal` module that lets the owner create, list, edit, and delete book/video diary entries with optional poster/cover images via upload or direct URL.

**Architecture:** Add `Journal` as a new full-stack vertical slice parallel to `Todo`. Persist entries in a dedicated `journal_entries` table, expose CRUD and image-upload endpoints from the Go API, and add a new `/app/journal` route in the React dashboard that reuses the existing shell, query, and test patterns.

**Tech Stack:** React 19 + TypeScript + Vite + React Router + TanStack Query + Vitest on the frontend; Go + chi + sqlc + goose + PostgreSQL on the backend.

---

## File Map

### Frontend files

- Create: `chidinh_client/src/modules/journal/journalTypes.ts`
  Responsibility: entry types, request payloads, upload response types.
- Create: `chidinh_client/src/modules/journal/journalFormState.ts`
  Responsibility: default form state and UI-only image mode state.
- Create: `chidinh_client/src/modules/journal/api.ts`
  Responsibility: journal CRUD requests and image upload request helpers.
- Create: `chidinh_client/src/modules/journal/JournalForm.tsx`
  Responsibility: create/edit form, image mode switching, validation UI.
- Create: `chidinh_client/src/modules/journal/JournalList.tsx`
  Responsibility: entry cards plus edit/delete actions.
- Create: `chidinh_client/src/modules/journal/JournalPage.tsx`
  Responsibility: query/mutation orchestration and page composition.
- Modify: `chidinh_client/src/shared/api/client.ts`
  Responsibility: allow `FormData` uploads without forcing JSON headers.
- Modify: `chidinh_client/src/app/router/routes.ts`
  Responsibility: add journal route constant.
- Modify: `chidinh_client/src/app/router/AppRouter.tsx`
  Responsibility: register journal page under the dashboard layout.
- Modify: `chidinh_client/src/modules/dashboard/shellNav.ts`
  Responsibility: expose `Journal` in dashboard navigation.
- Create: `chidinh_client/src/test/journal.page.test.tsx`
  Responsibility: page CRUD and upload-mode integration tests.
- Modify: `chidinh_client/src/test/router.test.tsx`
  Responsibility: cover `/app/journal` route.
- Modify: `chidinh_client/src/test/shared.desktop-shell.test.tsx`
  Responsibility: assert sidebar/dock navigation includes `Journal`.

### Backend files

- Create: `chidinh_api/db/migrations/0003_journal_entries.sql`
  Responsibility: create `journal_entries` table and indexes.
- Create: `chidinh_api/db/queries/journal.sql`
  Responsibility: sqlc CRUD queries for journal entries.
- Modify: `chidinh_api/db/sqlc/models.go`
  Responsibility: generated sqlc types for `journal_entries`.
- Modify: `chidinh_api/db/sqlc/journal.sql.go`
  Responsibility: generated query wrappers for journal entries.
- Create: `chidinh_api/internal/modules/journal/types.go`
  Responsibility: domain types, requests, patch fields, normalization.
- Create: `chidinh_api/internal/modules/journal/service.go`
  Responsibility: validation and orchestration for CRUD operations.
- Create: `chidinh_api/internal/modules/journal/repository.go`
  Responsibility: persistence mapping between sqlc rows and domain items.
- Create: `chidinh_api/internal/modules/journal/handler.go`
  Responsibility: CRUD HTTP handlers plus image upload handler.
- Create: `chidinh_api/internal/modules/journal/service_test.go`
  Responsibility: validation/unit behavior coverage.
- Create: `chidinh_api/internal/modules/journal/repository_test.go`
  Responsibility: persistence behavior coverage.
- Create: `chidinh_api/internal/modules/journal/handler_test.go`
  Responsibility: endpoint validation, CRUD, and upload behavior.
- Modify: `chidinh_api/internal/platform/httpserver/router.go`
  Responsibility: wire journal CRUD routes, upload route, and static file serving.
- Modify: `chidinh_api/internal/app/bootstrap.go`
  Responsibility: instantiate journal module and ensure upload directory exists.

### Documentation files

- Modify: `docs/architecture/2026-03-31-personal-digital-hub-mvp1-architecture.md`
  Responsibility: list `Journal` as an active private module.
- Modify: `docs/project/2026-03-31-mvp1-local-runbook.md`
  Responsibility: optionally add a short local smoke step for journal CRUD/upload.

## Task 1: Add Database Schema And sqlc Query Surface

**Files:**
- Create: `chidinh_api/db/migrations/0003_journal_entries.sql`
- Create: `chidinh_api/db/queries/journal.sql`
- Modify: generated sqlc files under `chidinh_api/db/sqlc/`

- [ ] **Step 1: Write the migration**

```sql
-- +goose Up
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('book', 'video')),
    title TEXT NOT NULL,
    image_url TEXT NULL,
    source_url TEXT NULL,
    review TEXT NULL,
    consumed_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_owner_consumed_created
    ON journal_entries (owner_id, consumed_on DESC, created_at DESC);
```

- [ ] **Step 2: Write the sqlc query file**

```sql
-- name: ListJournalEntriesByOwner :many
SELECT id, owner_id, type, title, image_url, source_url, review, consumed_on, created_at, updated_at
FROM journal_entries
WHERE owner_id = sqlc.arg(owner_id)
ORDER BY consumed_on DESC, created_at DESC;

-- name: GetJournalEntryByIDAndOwner :one
SELECT id, owner_id, type, title, image_url, source_url, review, consumed_on, created_at, updated_at
FROM journal_entries
WHERE id = sqlc.arg(id)
  AND owner_id = sqlc.arg(owner_id);

-- name: CreateJournalEntry :one
INSERT INTO journal_entries (id, owner_id, type, title, image_url, source_url, review, consumed_on)
VALUES (sqlc.arg(id), sqlc.arg(owner_id), sqlc.arg(type), sqlc.arg(title), sqlc.arg(image_url), sqlc.arg(source_url), sqlc.arg(review), sqlc.arg(consumed_on))
RETURNING id, owner_id, type, title, image_url, source_url, review, consumed_on, created_at, updated_at;
```

- [ ] **Step 3: Add update and delete queries in the same file**

```sql
-- name: UpdateJournalEntry :one
UPDATE journal_entries
SET type = sqlc.arg(type),
    title = sqlc.arg(title),
    image_url = sqlc.arg(image_url),
    source_url = sqlc.arg(source_url),
    review = sqlc.arg(review),
    consumed_on = sqlc.arg(consumed_on),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id)
  AND owner_id = sqlc.arg(owner_id)
RETURNING id, owner_id, type, title, image_url, source_url, review, consumed_on, created_at, updated_at;

-- name: DeleteJournalEntryByIDAndOwner :execrows
DELETE FROM journal_entries
WHERE id = sqlc.arg(id)
  AND owner_id = sqlc.arg(owner_id);
```

- [ ] **Step 4: Generate sqlc code**

Run: `cd /mnt/d/chidinh/chidinh_api && sqlc generate`

Expected: `db/sqlc/journal.sql.go` appears and generated models compile without manual edits.

- [ ] **Step 5: Commit the schema/query slice**

```bash
cd /mnt/d/chidinh
git add chidinh_api/db/migrations/0003_journal_entries.sql chidinh_api/db/queries/journal.sql chidinh_api/db/sqlc
git commit -m "feat(backend): add journal entry schema and queries"
```

## Task 2: Add Journal Domain Types, Validation, And Repository

**Files:**
- Create: `chidinh_api/internal/modules/journal/types.go`
- Create: `chidinh_api/internal/modules/journal/repository.go`
- Create: `chidinh_api/internal/modules/journal/service.go`
- Create: `chidinh_api/internal/modules/journal/service_test.go`
- Create: `chidinh_api/internal/modules/journal/repository_test.go`

- [ ] **Step 1: Write the failing service test for create validation**

```go
func TestServiceCreateRejectsBlankTitle(t *testing.T) {
    svc := NewService(newFakeJournalStore())

    _, err := svc.Create(context.Background(), "owner-1", CreateParams{
        Type:       TypeBook,
        Title:      "   ",
        ConsumedOn: time.Date(2026, 4, 9, 0, 0, 0, 0, time.UTC),
    })

    if !errors.Is(err, ErrInvalidTitle) {
        t.Fatalf("expected ErrInvalidTitle, got %v", err)
    }
}
```

- [ ] **Step 2: Define the journal types and validation errors**

```go
type EntryType string

const (
    TypeBook  EntryType = "book"
    TypeVideo EntryType = "video"
)

type Item struct {
    ID         string    `json:"id"`
    Type       EntryType `json:"type"`
    Title      string    `json:"title"`
    ImageURL   string    `json:"imageUrl,omitempty"`
    SourceURL  string    `json:"sourceUrl,omitempty"`
    Review     string    `json:"review,omitempty"`
    ConsumedOn string    `json:"consumedOn"`
    CreatedAt  time.Time `json:"createdAt"`
    UpdatedAt  time.Time `json:"updatedAt"`
}

var (
    ErrInvalidType      = errors.New("invalid journal type")
    ErrInvalidTitle     = errors.New("title is required")
    ErrTitleTooLong     = errors.New("title must be at most 200 characters")
    ErrInvalidImageURL  = errors.New("imageUrl must be a valid URL")
    ErrInvalidSourceURL = errors.New("sourceUrl must be a valid URL")
    ErrEmptyUpdate      = errors.New("at least one field is required")
)
```

- [ ] **Step 3: Implement repository create/list/update/delete against sqlc**

```go
type Repository struct {
    queries *db.Queries
}

func (r *Repository) List(ctx context.Context, ownerID string) ([]Item, error) {
    rows, err := r.queries.ListJournalEntriesByOwner(ctx, ownerID)
    if err != nil {
        return nil, fmt.Errorf("failed to list journal entries: %w", err)
    }
    items := make([]Item, 0, len(rows))
    for _, row := range rows {
        items = append(items, mapJournalRow(row))
    }
    return items, nil
}
```

- [ ] **Step 4: Implement service normalization and patch validation**

```go
func (s *Service) Create(ctx context.Context, ownerID string, params CreateParams) (Item, error) {
    params.Normalize()
    if err := params.Validate(); err != nil {
        return Item{}, err
    }
    return s.store.Create(ctx, ownerID, params)
}

func (p *UpdateParams) ValidateFields() error {
    if !p.Type.Present && !p.Title.Present && !p.ImageURL.Present && !p.SourceURL.Present && !p.Review.Present && !p.ConsumedOn.Present {
        return ErrEmptyUpdate
    }
    return nil
}
```

- [ ] **Step 5: Run the new backend unit tests**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/journal/...`

Expected: PASS for `service_test.go` and `repository_test.go`.

- [ ] **Step 6: Commit the domain slice**

```bash
cd /mnt/d/chidinh
git add chidinh_api/internal/modules/journal
git commit -m "feat(backend): add journal domain service and repository"
```

## Task 3: Add Journal HTTP CRUD Endpoints

**Files:**
- Create: `chidinh_api/internal/modules/journal/handler.go`
- Create: `chidinh_api/internal/modules/journal/handler_test.go`
- Modify: `chidinh_api/internal/platform/httpserver/router.go`
- Modify: `chidinh_api/internal/app/bootstrap.go`

- [ ] **Step 1: Write the failing handler test for list and create**

```go
func TestJournalHandlerCreate(t *testing.T) {
    router := newJournalTestRouter(newFakeJournalStore())

    req := httptest.NewRequest(http.MethodPost, "/api/v1/journal", bytes.NewBufferString(`{
        "type":"book",
        "title":"Clean Code",
        "consumedOn":"2026-04-09",
        "sourceUrl":"https://example.com/book"
    }`))
    req.Header.Set("Content-Type", "application/json")

    rec := httptest.NewRecorder()
    router.ServeHTTP(rec, withOwner(req))

    if rec.Code != http.StatusCreated {
        t.Fatalf("expected 201, got %d", rec.Code)
    }
}
```

- [ ] **Step 2: Implement request/response handlers**

```go
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
    ownerID := middleware.OwnerIDFromContext(r.Context())

    var req CreateRequest
    if err := decodeStrictJSON(r.Body, &req); err != nil {
        apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
        return
    }

    item, err := h.service.Create(r.Context(), ownerID, req.ToParams())
    if err != nil {
        writeJournalError(w, err, "create")
        return
    }

    apiresponse.WriteJSON(w, http.StatusCreated, map[string]any{"item": item})
}
```

- [ ] **Step 3: Wire router and bootstrap**

```go
journalRepository := journal.NewRepository(queries)
journalService := journal.NewService(journalRepository)
journalHandler := journal.NewHandler(journalService, requestValidator)

server := &http.Server{
    Addr: addr,
    Handler: httpserver.NewRouter(cfg, logger, authHandler, todoHandler, journalHandler, authMiddleware),
}
```

```go
router.Route("/api/v1/journal", func(r chi.Router) {
    r.Use(authMiddleware.Require)
    r.Get("/", journalHandler.List)
    r.Post("/", journalHandler.Create)
    r.Patch("/{entryID}", journalHandler.Update)
    r.Delete("/{entryID}", journalHandler.Delete)
})
```

- [ ] **Step 4: Run focused CRUD handler tests**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/journal -run 'TestJournalHandler(List|Create|Update|Delete)' -v`

Expected: PASS with 200/201/404/400 cases covered.

- [ ] **Step 5: Commit the CRUD HTTP slice**

```bash
cd /mnt/d/chidinh
git add chidinh_api/internal/modules/journal/handler.go chidinh_api/internal/modules/journal/handler_test.go chidinh_api/internal/platform/httpserver/router.go chidinh_api/internal/app/bootstrap.go
git commit -m "feat(backend): expose journal crud endpoints"
```

## Task 4: Add Image Upload Endpoint And Static Serving

**Files:**
- Modify: `chidinh_api/internal/modules/journal/handler.go`
- Modify: `chidinh_api/internal/modules/journal/handler_test.go`
- Modify: `chidinh_api/internal/platform/httpserver/router.go`
- Modify: `chidinh_api/internal/app/bootstrap.go`

- [ ] **Step 1: Write the failing upload tests**

```go
func TestJournalHandlerUploadImageRejectsNonImage(t *testing.T) {
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    part, _ := writer.CreateFormFile("file", "notes.txt")
    _, _ = part.Write([]byte("not-an-image"))
    _ = writer.Close()

    req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
    req.Header.Set("Content-Type", writer.FormDataContentType())

    rec := httptest.NewRecorder()
    newJournalTestRouter(newFakeJournalStore()).ServeHTTP(rec, withOwner(req))

    if rec.Code != http.StatusBadRequest {
        t.Fatalf("expected 400, got %d", rec.Code)
    }
}
```

- [ ] **Step 2: Ensure the upload directory exists at startup**

```go
if err := os.MkdirAll("uploads/images", 0o755); err != nil {
    return fmt.Errorf("create uploads directory: %w", err)
}
```

- [ ] **Step 3: Implement upload handler and static file route**

```go
func (h *Handler) UploadImage(w http.ResponseWriter, r *http.Request) {
    file, header, err := r.FormFile("file")
    if err != nil {
        apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "image file is required")
        return
    }
    defer file.Close()

    if !strings.HasPrefix(header.Header.Get("Content-Type"), "image/") {
        apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "file must be an image")
        return
    }

    filename := fmt.Sprintf("%s%s", uuid.NewString(), filepath.Ext(header.Filename))
    dstPath := filepath.Join("uploads", "images", filename)
    dst, err := os.Create(dstPath)
    if err != nil {
        apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to store image")
        return
    }
    defer dst.Close()

    _, _ = io.Copy(dst, file)
    apiresponse.WriteJSON(w, http.StatusCreated, map[string]any{"url": "/uploads/images/" + filename})
}
```

```go
router.Route("/api/v1/uploads", func(r chi.Router) {
    r.Use(authMiddleware.Require)
    r.Post("/images", journalHandler.UploadImage)
})

router.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))
```

- [ ] **Step 4: Run upload-focused tests**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./internal/modules/journal -run 'TestJournalHandlerUploadImage' -v`

Expected: PASS for success and invalid-file cases.

- [ ] **Step 5: Commit the upload slice**

```bash
cd /mnt/d/chidinh
git add chidinh_api/internal/modules/journal/handler.go chidinh_api/internal/modules/journal/handler_test.go chidinh_api/internal/platform/httpserver/router.go chidinh_api/internal/app/bootstrap.go
git commit -m "feat(backend): add journal image uploads"
```

## Task 5: Add Frontend Route, Navigation, And API Client

**Files:**
- Modify: `chidinh_client/src/shared/api/client.ts`
- Modify: `chidinh_client/src/app/router/routes.ts`
- Modify: `chidinh_client/src/app/router/AppRouter.tsx`
- Modify: `chidinh_client/src/modules/dashboard/shellNav.ts`
- Create: `chidinh_client/src/modules/journal/journalTypes.ts`
- Create: `chidinh_client/src/modules/journal/journalFormState.ts`
- Create: `chidinh_client/src/modules/journal/api.ts`
- Create: `chidinh_client/src/modules/journal/JournalPage.tsx`
- Modify: `chidinh_client/src/test/router.test.tsx`
- Modify: `chidinh_client/src/test/shared.desktop-shell.test.tsx`

- [ ] **Step 1: Write the failing route and nav tests**

```tsx
it("renders the journal route inside the dashboard shell", () => {
  render(
    <MemoryRouter initialEntries={["/app/journal"]}>
      <AppRoutes />
    </MemoryRouter>,
  );

  expect(screen.getByRole("heading", { name: /journal/i })).toBeInTheDocument();
});
```

```tsx
expect(screen.getByRole("link", { name: /journal/i })).toBeInTheDocument();
```

- [ ] **Step 2: Add route constants and shell nav entry**

```ts
export const APP_ROUTES = {
  publicHome: "/",
  login: "/login",
  appRoot: "/app",
  todo: "/app/todo",
  journal: "/app/journal",
} as const;
```

```ts
export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { label: "Home", to: "/app", end: true },
  { label: "Todo", to: "/app/todo" },
  { label: "Journal", to: "/app/journal" },
  { label: "Public Hub", to: "/" },
];
```

- [ ] **Step 3: Extend the shared API client for multipart uploads**

```ts
type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: isFormData
      ? options.headers
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
    body: options.body
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}
```

- [ ] **Step 4: Add frontend types, defaults, and API helpers**

```ts
export type JournalEntryType = "book" | "video";

export type JournalEntry = {
  id: string;
  type: JournalEntryType;
  title: string;
  imageUrl?: string;
  sourceUrl?: string;
  review?: string;
  consumedOn: string;
  createdAt: string;
  updatedAt: string;
};

export async function uploadJournalImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ url: string }>("/api/v1/uploads/images", {
    method: "POST",
    body: formData,
  });
}
```

- [ ] **Step 5: Register a temporary `JournalPage` placeholder to make tests pass**

```tsx
<Route path="journal" element={<JournalPage />} />
```

```tsx
export function JournalPage() {
  return <h1>Journal</h1>;
}
```

- [ ] **Step 6: Run the focused frontend shell tests**

Run: `cd /mnt/d/chidinh/chidinh_client && npx vitest run src/test/router.test.tsx src/test/shared.desktop-shell.test.tsx`

Expected: PASS with `Journal` present in routing and navigation.

- [ ] **Step 7: Commit the frontend shell slice**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/shared/api/client.ts chidinh_client/src/app/router/routes.ts chidinh_client/src/app/router/AppRouter.tsx chidinh_client/src/modules/dashboard/shellNav.ts chidinh_client/src/modules/journal chidinh_client/src/test/router.test.tsx chidinh_client/src/test/shared.desktop-shell.test.tsx
git commit -m "feat(frontend): add journal route and client api"
```

## Task 6: Build Journal Page CRUD UI

**Files:**
- Create: `chidinh_client/src/modules/journal/JournalForm.tsx`
- Create: `chidinh_client/src/modules/journal/JournalList.tsx`
- Create: `chidinh_client/src/modules/journal/JournalPage.tsx`
- Create: `chidinh_client/src/test/journal.page.test.tsx`

- [ ] **Step 1: Write the failing page test for list + create**

```tsx
it("creates a journal entry and refreshes the list", async () => {
  const user = userEvent.setup();
  const fetchMock = mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
    jsonResponse({
      item: {
        id: "journal-1",
        type: "book",
        title: "Atomic Habits",
        consumedOn: "2026-04-09",
        createdAt: "2026-04-09T10:00:00.000Z",
        updatedAt: "2026-04-09T10:00:00.000Z",
      },
    }),
    jsonResponse({ items: [{ id: "journal-1", type: "book", title: "Atomic Habits", consumedOn: "2026-04-09", createdAt: "2026-04-09T10:00:00.000Z", updatedAt: "2026-04-09T10:00:00.000Z" }] }),
  );

  renderJournalRoute();
  await user.type(screen.getByLabelText(/title/i), "Atomic Habits");
  await user.selectOptions(screen.getByLabelText(/type/i), "book");
  await user.type(screen.getByLabelText(/consumed date/i), "2026-04-09");
  await user.click(screen.getByRole("button", { name: /save entry/i }));

  await screen.findByText("Atomic Habits");
  expect(fetchMock).toHaveBeenCalled();
});
```

- [ ] **Step 2: Implement the form component**

```tsx
export function JournalForm(props: {
  value: JournalFormState;
  mode: "create" | "edit";
  onChange: (value: JournalFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSaving: boolean;
  formError: string | null;
}) {
  const { value, mode, onChange, onSubmit, onCancel, isSaving, formError } = props;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field>
        <label htmlFor="journal-type">Type</label>
        <select id="journal-type" value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value as JournalEntryType })}>
          <option value="book">Book</option>
          <option value="video">Video</option>
        </select>
      </Field>
    </form>
  );
}
```

- [ ] **Step 3: Implement the list component with edit/delete actions**

```tsx
export function JournalList(props: {
  items: JournalEntry[];
  onEdit: (item: JournalEntry) => void;
  onDelete: (id: string) => void;
}) {
  const { items, onEdit, onDelete } = props;
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Panel key={item.id} className="grid gap-4 md:grid-cols-[120px_1fr]">
          {item.imageUrl ? <img src={item.imageUrl} alt={`${item.title} cover`} className="h-40 w-full rounded object-cover" /> : <div className="h-40 border-2 bg-muted" />}
          <div className="space-y-2">
            <h3>{item.title}</h3>
            <p>{item.type} · {item.consumedOn}</p>
            {item.review ? <p>{item.review}</p> : null}
            <div className="flex gap-2">
              <Button type="button" onClick={() => onEdit(item)}>Edit</Button>
              <Button type="button" variant="secondary" onClick={() => onDelete(item.id)}>Delete</Button>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Implement page orchestration with query invalidation**

```tsx
const journalQuery = useQuery({
  queryKey: ["journal"],
  queryFn: listJournalEntries,
});

const createMutation = useMutation({
  mutationFn: createJournalEntry,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal"] }),
});
```

- [ ] **Step 5: Add edit/delete tests and make them pass**

Run: `cd /mnt/d/chidinh/chidinh_client && npx vitest run src/test/journal.page.test.tsx`

Expected: PASS for empty state, create, edit, and delete flows.

- [ ] **Step 6: Commit the page CRUD slice**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/journal/JournalForm.tsx chidinh_client/src/modules/journal/JournalList.tsx chidinh_client/src/modules/journal/JournalPage.tsx chidinh_client/src/test/journal.page.test.tsx
git commit -m "feat(frontend): add journal page crud ui"
```

## Task 7: Add Image URL And Upload UX

**Files:**
- Modify: `chidinh_client/src/modules/journal/journalFormState.ts`
- Modify: `chidinh_client/src/modules/journal/JournalForm.tsx`
- Modify: `chidinh_client/src/modules/journal/JournalPage.tsx`
- Modify: `chidinh_client/src/test/journal.page.test.tsx`

- [ ] **Step 1: Write the failing test for upload mode and URL mode**

```tsx
it("uploads an image file and saves the returned imageUrl", async () => {
  const user = userEvent.setup();
  const file = new File(["fake"], "cover.png", { type: "image/png" });
  const fetchMock = mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
    jsonResponse({ url: "/uploads/images/cover.png" }),
    jsonResponse({
      item: {
        id: "journal-1",
        type: "video",
        title: "Perfect Days",
        imageUrl: "/uploads/images/cover.png",
        consumedOn: "2026-04-09",
        createdAt: "2026-04-09T10:00:00.000Z",
        updatedAt: "2026-04-09T10:00:00.000Z",
      },
    }),
    jsonResponse({ items: [] }),
  );

  renderJournalRoute();
  await user.upload(screen.getByLabelText(/upload image/i), file);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/v1/uploads/images", expect.anything()));
});
```

- [ ] **Step 2: Add image mode state and switching UI**

```ts
export type JournalImageMode = "upload" | "url";

export const DEFAULT_JOURNAL_FORM_STATE: JournalFormState = {
  type: "book",
  title: "",
  imageMode: "upload",
  imageUrl: "",
  sourceUrl: "",
  review: "",
  consumedOn: "",
};
```

```tsx
<fieldset>
  <legend>Poster / Cover</legend>
  <label>
    <input type="radio" checked={value.imageMode === "upload"} onChange={() => onChange({ ...value, imageMode: "upload", imageUrl: "" })} />
    Upload file
  </label>
  <label>
    <input type="radio" checked={value.imageMode === "url"} onChange={() => onChange({ ...value, imageMode: "url" })} />
    Paste image URL
  </label>
</fieldset>
```

- [ ] **Step 3: Upload the file before final submit**

```tsx
if (formState.imageMode === "upload" && selectedFile) {
  const upload = await uploadJournalImage(selectedFile);
  payload.imageUrl = upload.url;
}

if (formState.imageMode === "url" && formState.imageUrl.trim()) {
  payload.imageUrl = formState.imageUrl.trim();
}
```

- [ ] **Step 4: Run the focused image-mode tests**

Run: `cd /mnt/d/chidinh/chidinh_client && npx vitest run src/test/journal.page.test.tsx -t "uploads an image file|switches to image url mode"`

Expected: PASS with upload request sent before journal save and URL mode bypassing upload.

- [ ] **Step 5: Commit the image UX slice**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/journal/journalFormState.ts chidinh_client/src/modules/journal/JournalForm.tsx chidinh_client/src/modules/journal/JournalPage.tsx chidinh_client/src/test/journal.page.test.tsx
git commit -m "feat(frontend): add journal image upload and url modes"
```

## Task 8: Update Docs And Run End-To-End Verification

**Files:**
- Modify: `docs/architecture/2026-03-31-personal-digital-hub-mvp1-architecture.md`
- Modify: `docs/project/2026-03-31-mvp1-local-runbook.md`

- [ ] **Step 1: Update architecture docs**

```md
Private area:

- login page
- authenticated dashboard shell
- todo module
- journal module
```

```md
`modules/journal/`
- journal diary screen
- create/edit form
- entry actions
```

- [ ] **Step 2: Add a short local smoke sequence to the runbook**

```bash
curl -fsS -b "$COOKIE_JAR" "$API/api/v1/journal"

curl -fsS -b "$COOKIE_JAR" -X POST "$API/api/v1/journal" \
  -H "Content-Type: application/json" \
  -d '{"type":"book","title":"journal smoke","consumedOn":"2026-04-09"}'
```

- [ ] **Step 3: Run the full frontend test suite**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test`

Expected: PASS with new journal route/page coverage included.

- [ ] **Step 4: Run the frontend production build**

Run: `cd /mnt/d/chidinh/chidinh_client && npm run build`

Expected: PASS and Vite production bundle completes without route/module errors.

- [ ] **Step 5: Run focused backend checks**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./... && go build ./cmd/api`

Expected: PASS with journal module and upload route compiling cleanly.

- [ ] **Step 6: Commit docs and final verification state**

```bash
cd /mnt/d/chidinh
git add docs/architecture/2026-03-31-personal-digital-hub-mvp1-architecture.md docs/project/2026-03-31-mvp1-local-runbook.md
git commit -m "docs: document journal module"
```

## Spec Coverage Check

- New dashboard route and sidebar entry: Task 5
- Frontend create/list/edit/delete flows: Task 6
- Upload file and image URL support: Task 4 and Task 7
- Dedicated backend CRUD module: Task 2 and Task 3
- Dedicated database table and sqlc queries: Task 1
- Validation and focused tests: Tasks 2 through 8
- Documentation alignment: Task 8
