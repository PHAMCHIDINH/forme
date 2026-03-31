# Personal Digital Hub MVP 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MVP 1 of the Personal Digital Hub with public portfolio, owner authentication, dashboard shell, todo CRUD, and production deployment on Vercel and Railway.

**Architecture:** The system is split into a React frontend and a Go backend with PostgreSQL. Both applications are organized as modular monoliths so MVP 1 remains easy to operate while keeping boundaries ready for future modules.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, Go, chi, pgx, sqlc, goose, PostgreSQL, Docker, GitHub Actions

---

## Planned Repository Structure

```text
/mnt/d/chidinh/
  docs/
  chidinh_client/
    package.json
    vite.config.ts
    src/
      app/
      modules/
      shared/
      test/
  chidinh_api/
    go.mod
    cmd/api/main.go
    internal/
    db/
      migrations/
      queries/
```

## Task 1: Scaffold Frontend Application

**Files:**
- Create: `chidinh_client/package.json`
- Create: `chidinh_client/tsconfig.json`
- Create: `chidinh_client/vite.config.ts`
- Create: `chidinh_client/src/main.tsx`
- Create: `chidinh_client/src/app/router/index.tsx`
- Create: `chidinh_client/src/app/providers/index.tsx`
- Create: `chidinh_client/src/shared/ui/app-shell.tsx`
- Test: `chidinh_client/src/test/app-smoke.test.tsx`

- [ ] **Step 1: Write the failing frontend smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "../main";

describe("app bootstrap", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText(/personal digital hub/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: FAIL because the frontend project and `App` export do not exist yet.

- [ ] **Step 3: Create the minimal frontend bootstrap**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return <div>Personal Digital Hub</div>;
}

export default App;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 4: Add Vite, React, TypeScript, and test tooling**

```json
{
  "name": "chidinh-client",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: PASS with one passing smoke test.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client
git commit -m "feat: scaffold frontend app"
```

## Task 2: Build Public Portfolio and Routing Shell

**Files:**
- Create: `chidinh_client/src/modules/portfolio/data.ts`
- Create: `chidinh_client/src/modules/portfolio/page.tsx`
- Create: `chidinh_client/src/modules/auth/login-page.tsx`
- Create: `chidinh_client/src/modules/dashboard/layout.tsx`
- Modify: `chidinh_client/src/app/router/index.tsx`
- Test: `chidinh_client/src/test/router.test.tsx`

- [ ] **Step 1: Write the failing routing test**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRouter } from "../app/router";

describe("routing", () => {
  it("renders portfolio on the public route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByText(/selected projects/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: FAIL because the route tree and portfolio page do not exist.

- [ ] **Step 3: Add public and dashboard routes**

```tsx
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<div>Dashboard Home</div>} />
        <Route path="todo" element={<div>Todo Module</div>} />
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 4: Add static portfolio data and page**

```ts
export const portfolioData = {
  name: "Chidinh",
  headline: "Building practical web and AI products",
  projects: [
    { name: "AI Service Hub", summary: "Service-oriented AI tooling platform" },
    { name: "Marketplace Platform", summary: "E-commerce marketplace product" }
  ]
};
```

```tsx
export function PortfolioPage() {
  return (
    <main>
      <h1>{portfolioData.name}</h1>
      <p>{portfolioData.headline}</p>
      <h2>Selected Projects</h2>
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: PASS with routing test and smoke test both passing.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client
git commit -m "feat: add public portfolio and app routes"
```

## Task 3: Scaffold Backend Service and Health Endpoint

**Files:**
- Create: `chidinh_api/go.mod`
- Create: `chidinh_api/cmd/api/main.go`
- Create: `chidinh_api/internal/app/bootstrap.go`
- Create: `chidinh_api/internal/platform/config/config.go`
- Create: `chidinh_api/internal/platform/httpserver/router.go`
- Test: `chidinh_api/internal/platform/httpserver/router_test.go`

- [ ] **Step 1: Write the failing backend health test**

```go
func TestHealthRoute(t *testing.T) {
    router := NewRouter()
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    rec := httptest.NewRecorder()

    router.ServeHTTP(rec, req)

    if rec.Code != http.StatusOK {
        t.Fatalf("expected 200, got %d", rec.Code)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: FAIL because no Go module or router exists.

- [ ] **Step 3: Create minimal Go service**

```go
func NewRouter() http.Handler {
    r := chi.NewRouter()
    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        _, _ = w.Write([]byte("ok"))
    })
    return r
}
```

- [ ] **Step 4: Add server bootstrap**

```go
func main() {
    router := httpserver.NewRouter()
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: PASS with the health route test passing.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api
git commit -m "feat: scaffold backend service"
```

## Task 4: Add PostgreSQL Schema, Queries, and Todo Repository

**Files:**
- Create: `chidinh_api/db/migrations/0001_init.sql`
- Create: `chidinh_api/db/queries/auth.sql`
- Create: `chidinh_api/db/queries/todos.sql`
- Create: `chidinh_api/internal/modules/todo/repository.go`
- Create: `chidinh_api/internal/modules/todo/repository_test.go`

- [ ] **Step 1: Write the failing repository test**

```go
func TestCreateTodo(t *testing.T) {
    repo := NewRepository(testQueries)
    item, err := repo.Create(context.Background(), CreateTodoParams{
        OwnerID: "owner",
        Title:   "First task",
    })
    if err != nil {
        t.Fatal(err)
    }
    if item.Title != "First task" {
        t.Fatalf("expected saved title, got %q", item.Title)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: FAIL because migrations, queries, and repository code do not exist.

- [ ] **Step 3: Create the initial schema**

```sql
CREATE TABLE owners (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE todos (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 4: Add sqlc queries and repository wrapper**

```sql
-- name: ListTodosByOwner :many
SELECT id, owner_id, title, completed, created_at, updated_at
FROM todos
WHERE owner_id = $1
ORDER BY created_at DESC;
```

```go
type Repository struct {
    queries *db.Queries
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: PASS after generating sqlc code and wiring the repository test database.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api
git commit -m "feat: add todo database schema and repository"
```

## Task 5: Implement Authentication API and Middleware

**Files:**
- Create: `chidinh_api/internal/modules/auth/service.go`
- Create: `chidinh_api/internal/modules/auth/handler.go`
- Create: `chidinh_api/internal/platform/middleware/auth.go`
- Create: `chidinh_api/internal/modules/auth/handler_test.go`
- Modify: `chidinh_api/internal/platform/httpserver/router.go`

- [ ] **Step 1: Write the failing auth login test**

```go
func TestLoginSuccess(t *testing.T) {
    req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(`{"username":"owner","password":"secret"}`))
    req.Header.Set("Content-Type", "application/json")
    rec := httptest.NewRecorder()

    router := NewRouterWithAuth(fakeAuthService)
    router.ServeHTTP(rec, req)

    if rec.Code != http.StatusOK {
        t.Fatalf("expected 200, got %d", rec.Code)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: FAIL because auth handlers and middleware do not exist.

- [ ] **Step 3: Implement login, me, and logout handlers**

```go
r.Route("/api/v1/auth", func(r chi.Router) {
    r.Post("/login", authHandler.Login)
    r.Get("/me", authMiddleware.RequireAuth(authHandler.Me))
    r.Post("/logout", authHandler.Logout)
})
```

```go
type LoginRequest struct {
    Username string `json:"username" validate:"required"`
    Password string `json:"password" validate:"required"`
}
```

- [ ] **Step 4: Implement JWT cookie issue and auth middleware**

```go
func (m *Middleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        token, err := r.Cookie("pdh_auth")
        if err != nil {
            writeUnauthorized(w)
            return
        }
        claims, err := m.authService.VerifyToken(token.Value)
        if err != nil {
            writeUnauthorized(w)
            return
        }
        ctx := context.WithValue(r.Context(), ownerKey, claims.Subject)
        next(w, r.WithContext(ctx))
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: PASS with login and auth middleware tests passing.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api
git commit -m "feat: add owner authentication"
```

## Task 6: Implement Todo API

**Files:**
- Create: `chidinh_api/internal/modules/todo/service.go`
- Create: `chidinh_api/internal/modules/todo/handler.go`
- Create: `chidinh_api/internal/modules/todo/handler_test.go`
- Modify: `chidinh_api/internal/platform/httpserver/router.go`

- [ ] **Step 1: Write the failing todo create test**

```go
func TestCreateTodoHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodPost, "/api/v1/todos", strings.NewReader(`{"title":"Write docs"}`))
    req.Header.Set("Content-Type", "application/json")
    req.AddCookie(&http.Cookie{Name: "pdh_auth", Value: validToken})
    rec := httptest.NewRecorder()

    router := NewRouterWithTodo(fakeTodoService)
    router.ServeHTTP(rec, req)

    if rec.Code != http.StatusCreated {
        t.Fatalf("expected 201, got %d", rec.Code)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: FAIL because todo handlers and routes do not exist.

- [ ] **Step 3: Implement todo service and handlers**

```go
r.Route("/api/v1/todos", func(r chi.Router) {
    r.Use(authMiddleware.RequireAuthMiddleware)
    r.Get("/", todoHandler.List)
    r.Post("/", todoHandler.Create)
    r.Patch("/{todoID}", todoHandler.Update)
    r.Delete("/{todoID}", todoHandler.Delete)
})
```

```go
type CreateTodoRequest struct {
    Title string `json:"title" validate:"required,max=200"`
}
```

- [ ] **Step 4: Implement validation and owner scoping**

```go
ownerID := auth.OwnerIDFromContext(r.Context())
item, err := h.service.Create(r.Context(), todo.CreateParams{
    OwnerID: ownerID,
    Title:   strings.TrimSpace(req.Title),
})
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_api && go test ./...`
Expected: PASS with todo handler and service tests passing.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_api
git commit -m "feat: add todo api"
```

## Task 7: Implement Frontend Authentication and Protected Dashboard

**Files:**
- Create: `chidinh_client/src/modules/auth/api.ts`
- Create: `chidinh_client/src/modules/auth/use-session.ts`
- Create: `chidinh_client/src/modules/auth/require-auth.tsx`
- Modify: `chidinh_client/src/modules/auth/login-page.tsx`
- Modify: `chidinh_client/src/modules/dashboard/layout.tsx`
- Test: `chidinh_client/src/test/auth-flow.test.tsx`

- [ ] **Step 1: Write the failing protected route test**

```tsx
it("redirects guests from /app to /login", async () => {
  render(<AppRouter initialEntries={["/app"]} />);
  expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: FAIL because protected route logic and session loading do not exist.

- [ ] **Step 3: Add auth API client and session query**

```ts
export async function getCurrentSession() {
  return apiClient.get("/api/v1/auth/me");
}

export async function login(payload: LoginPayload) {
  return apiClient.post("/api/v1/auth/login", payload);
}
```

- [ ] **Step 4: Add route guard and login flow**

```tsx
export function RequireAuth() {
  const { isLoading, isAuthenticated } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: PASS with protected route tests passing.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client
git commit -m "feat: add frontend auth flow"
```

## Task 8: Implement Todo UI with API Integration

**Files:**
- Create: `chidinh_client/src/modules/todo/api.ts`
- Create: `chidinh_client/src/modules/todo/page.tsx`
- Create: `chidinh_client/src/modules/todo/components/todo-form.tsx`
- Create: `chidinh_client/src/modules/todo/components/todo-list.tsx`
- Modify: `chidinh_client/src/app/router/index.tsx`
- Test: `chidinh_client/src/test/todo-page.test.tsx`

- [ ] **Step 1: Write the failing todo UI test**

```tsx
it("creates a todo from the dashboard screen", async () => {
  render(<TodoPage />);
  await userEvent.type(screen.getByLabelText(/task title/i), "Wire CI");
  await userEvent.click(screen.getByRole("button", { name: /add task/i }));
  expect(await screen.findByText("Wire CI")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: FAIL because the todo UI and API hooks do not exist.

- [ ] **Step 3: Add todo API hooks**

```ts
export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: listTodos,
  });
}
```

```ts
export function useCreateTodo() {
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
}
```

- [ ] **Step 4: Build todo screen**

```tsx
export function TodoPage() {
  const { data } = useTodos();
  return (
    <section>
      <h1>Todo</h1>
      <TodoForm />
      <TodoList items={data?.items ?? []} />
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- --runInBand`
Expected: PASS with todo create, toggle, and delete tests passing.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client
git commit -m "feat: add todo dashboard ui"
```

## Task 9: Add Docker and Environment Configuration

**Files:**
- Create: `chidinh_client/Dockerfile`
- Create: `chidinh_client/.env.example`
- Create: `chidinh_api/Dockerfile`
- Create: `chidinh_api/.env.example`
- Create: `/mnt/d/chidinh/docker-compose.yml`

- [ ] **Step 1: Write the failing container smoke step**

```bash
docker build -t pdh-client-test /mnt/d/chidinh/chidinh_client
docker build -t pdh-api-test /mnt/d/chidinh/chidinh_api
```

- [ ] **Step 2: Run the container build to verify it fails**

Run: `cd /mnt/d/chidinh && docker build -t pdh-client-test chidinh_client`
Expected: FAIL because no Dockerfiles exist yet.

- [ ] **Step 3: Add frontend and backend Dockerfiles**

```Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

```Dockerfile
FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o api ./cmd/api
```

- [ ] **Step 4: Add env examples and local compose file**

```env
VITE_API_BASE_URL=http://localhost:8080
```

```env
PORT=8080
DATABASE_URL=postgres://postgres:postgres@db:5432/pdh?sslmode=disable
JWT_SECRET=change-me
OWNER_USERNAME=owner
OWNER_PASSWORD_HASH=<hash>
```

- [ ] **Step 5: Re-run container build to verify it passes**

Run: `cd /mnt/d/chidinh && docker build -t pdh-client-test chidinh_client && docker build -t pdh-api-test chidinh_api`
Expected: PASS with both images building successfully.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add chidinh_client chidinh_api docker-compose.yml
git commit -m "chore: add containerization and env examples"
```

## Task 10: Add CI/CD Workflows and Production Readiness Checks

**Files:**
- Create: `/mnt/d/chidinh/.github/workflows/ci.yml`
- Create: `/mnt/d/chidinh/.github/workflows/deploy.yml`
- Create: `/mnt/d/chidinh/docs/deployment/2026-03-31-mvp1-deploy-runbook.md`

- [ ] **Step 1: Write the failing CI expectation**

```yaml
name: ci
on:
  push:
    branches: ["main"]
jobs: {}
```

- [ ] **Step 2: Verify current repository has no workflow coverage**

Run: `cd /mnt/d/chidinh && find .github -maxdepth 3 -type f`
Expected: no workflow files found.

- [ ] **Step 3: Add CI workflow**

```yaml
jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: chidinh_client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --runInBand
      - run: npm run build
```

```yaml
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: chidinh_api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
      - run: go test ./...
      - run: go build ./cmd/api
```

- [ ] **Step 4: Add deploy workflow and runbook**

```yaml
name: deploy
on:
  push:
    branches: ["main"]
jobs:
  deploy-frontend:
    steps:
      - uses: actions/checkout@v4
      - run: echo "Trigger Vercel deployment"
  deploy-backend:
    steps:
      - uses: actions/checkout@v4
      - run: echo "Trigger Railway deployment"
```

- [ ] **Step 5: Validate workflow syntax and deployment docs**

Run: `cd /mnt/d/chidinh && git diff -- .github/workflows docs/deployment`
Expected: workflow files and deploy runbook present with Vercel and Railway steps documented.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh
git add .github docs/deployment
git commit -m "chore: add ci cd workflows"
```

## Plan Self-Review

### Spec Coverage

- PRD core/auth requirements: covered by Tasks 5 and 7
- Public portfolio requirements: covered by Task 2
- Todo CRUD requirements: covered by Tasks 4, 6, and 8
- Docker and deployment requirements: covered by Tasks 9 and 10
- Platform scaffold and shared structure: covered by Tasks 1 and 3

### Placeholder Scan

- No `TBD` or `TODO` placeholders remain in the task list.
- All tasks include exact file paths.
- All code-writing tasks include code snippets.

### Type Consistency

- Auth cookie name is consistently `pdh_auth`.
- API base path is consistently `/api/v1`.
- Frontend and backend both use `todo` naming for the first private tool.

Plan complete and saved to `docs/superpowers/plans/2026-03-31-personal-digital-hub-mvp1.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
