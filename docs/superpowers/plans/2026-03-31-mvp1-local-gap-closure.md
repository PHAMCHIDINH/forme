# MVP1 Local Gap Closure (No Deploy) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện toàn bộ phần MVP1 còn thiếu để chạy ổn định trên local, bám sát docs hiện tại, tạm hoãn deploy.

**Architecture:** Giữ kiến trúc modular monolith hiện có cho frontend/backend. Ưu tiên đóng gap ở lớp dữ liệu (owners + FK), bảo mật auth (password hash), cấu hình CORS/cookie rõ ràng, và tăng test coverage theo tài liệu kỹ thuật trước khi làm CI deploy.

**Tech Stack:** React + TypeScript + Vite + React Router + TanStack Query + Vitest, Go + chi + pgx + sqlc + goose + validator + slog, PostgreSQL, Docker Compose

---

## Local Scope (Deploy Excluded)

- Bao gồm:
  - Schema `owners` + ràng buộc `todos.owner_id -> owners(id)`
  - Auth dùng password hash (bcrypt), không dùng plaintext password
  - SQLC cho auth + todo
  - Goose migration local
  - CORS/config hardening cho local correctness
  - Test backend + frontend theo docs
  - Local runbook/checklist
- Không bao gồm:
  - Vercel deployment
  - Railway deployment
  - GitHub Actions deploy job

## Task 1: Chuẩn hóa Schema + SQLC cho Owner/Todo

**Files:**
- Modify: `chidinh_api/db/migrations/0001_init.sql`
- Create: `chidinh_api/db/queries/auth.sql`
- Modify: `chidinh_api/db/queries/todos.sql`
- Modify (generated): `chidinh_api/db/sqlc/*.go`
- Modify: `chidinh_api/sqlc.yaml`

- [ ] **Step 1: Viết test backend fail cho owner-aware todo**

```go
func TestTodoRequiresExistingOwner(t *testing.T) {
    // tạo DB test, chỉ có schema
    // khi create todo với owner không tồn tại => fail FK
}
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./...`
Expected: FAIL vì chưa có `owners` table + FK.

- [ ] **Step 3: Cập nhật migration**

```sql
CREATE TABLE IF NOT EXISTS owners (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 4: Thêm SQLC query cho auth owner**

```sql
-- name: GetOwnerByUsername :one
SELECT id, username, password_hash, display_name, created_at, updated_at
FROM owners
WHERE username = $1;

-- name: GetOwnerByID :one
SELECT id, username, password_hash, display_name, created_at, updated_at
FROM owners
WHERE id = $1;
```

- [ ] **Step 5: Regenerate SQLC**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && C:\\Users\\chidi_hziq9vo\\go\\bin\\sqlc.exe generate -f sqlc.yaml`
Expected: PASS, có thêm model/query cho `owners`.

- [ ] **Step 6: Chạy test lại**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./...`
Expected: Test pass (hoặc chuyển sang fail tiếp do auth chưa sửa, được xử lý ở Task 2).

- [ ] **Step 7: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_api/db/migrations/0001_init.sql chidinh_api/db/queries/auth.sql chidinh_api/db/queries/todos.sql chidinh_api/db/sqlc chidinh_api/sqlc.yaml
git commit -m "feat(api): add owners schema and sqlc auth queries"
```

## Task 2: Chuyển Auth sang Password Hash + Owner trong DB

**Files:**
- Modify: `chidinh_api/internal/modules/auth/service.go`
- Modify: `chidinh_api/internal/modules/auth/types.go`
- Modify: `chidinh_api/internal/modules/auth/handler.go`
- Modify: `chidinh_api/internal/app/bootstrap.go`
- Modify: `chidinh_api/internal/platform/config/config.go`
- Modify: `chidinh_api/internal/modules/todo/repository.go`
- Modify: `chidinh_api/.env.example`

- [ ] **Step 1: Viết test fail cho login hash flow**

```go
func TestLoginSuccessWithBcryptHash(t *testing.T) {
    // owner.password_hash = bcrypt("owner123")
    // Login("owner","owner123") => token hợp lệ
}
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./internal/modules/auth -v`
Expected: FAIL vì code còn so sánh plaintext.

- [ ] **Step 3: Sửa config env**

```go
type Config struct {
    OwnerUsername     string
    OwnerPasswordHash string
}
```

```env
OWNER_USERNAME=owner
OWNER_PASSWORD_HASH=$2a$12$...
```

- [ ] **Step 4: Refactor Auth service dùng repository + bcrypt**

```go
owner, err := s.ownerRepo.GetByUsername(ctx, username)
if err != nil { return "", ErrInvalidCredentials }
if bcrypt.CompareHashAndPassword([]byte(owner.PasswordHash), []byte(password)) != nil {
    return "", ErrInvalidCredentials
}
```

- [ ] **Step 5: Chuẩn hóa owner identity qua DB**

```go
claims.Subject = owner.ID
claims.Username = owner.Username
```

- [ ] **Step 6: Sửa todo owner source theo claims subject**

```go
ownerID := middleware.OwnerIDFromContext(r.Context()) // giờ là owner thật từ DB
```

- [ ] **Step 7: Chạy test auth + backend**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./...`
Expected: PASS các test auth/todo hiện có.

- [ ] **Step 8: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_api/internal/modules/auth chidinh_api/internal/app/bootstrap.go chidinh_api/internal/modules/todo/repository.go chidinh_api/internal/platform/config/config.go chidinh_api/.env.example
git commit -m "feat(api): switch auth to bcrypt hash and db owner identity"
```

## Task 3: Seed Owner Local + Goose Migration Flow

**Files:**
- Modify: `chidinh_api/go.mod`
- Create: `chidinh_api/cmd/migrate/main.go`
- Create: `chidinh_api/internal/platform/database/seed.go`
- Create: `chidinh_api/Makefile`
- Modify: `chidinh_api/internal/app/bootstrap.go`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Viết test fail cho owner seed idempotent**

```go
func TestEnsureOwnerSeedIdempotent(t *testing.T) {
    // gọi EnsureOwnerSeed 2 lần
    // kiểm tra chỉ có 1 owner theo username
}
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./internal/platform/database -v`
Expected: FAIL do chưa có logic seed.

- [ ] **Step 3: Thêm goose + migrate command**

```go
import "github.com/pressly/goose/v3"
goose.SetDialect("postgres")
goose.Up(db, "db/migrations")
```

- [ ] **Step 4: Thêm EnsureOwnerSeed**

```go
func EnsureOwnerSeed(ctx context.Context, q *db.Queries, username, passwordHash string) error {
    // nếu chưa có owner theo username thì insert
}
```

- [ ] **Step 5: Đổi bootstrap sang flow chuẩn**

```go
// bỏ EnsureSchema runtime SQL string
// startup: connect DB -> ensure owner seed -> start server
// migrations chạy qua cmd/migrate hoặc make target
```

- [ ] **Step 6: Thêm Make targets**

```make
migrate-up:
	"/mnt/c/Program Files/Go/bin/go.exe" run ./cmd/migrate up

run:
	"/mnt/c/Program Files/Go/bin/go.exe" run ./cmd/api
```

- [ ] **Step 7: Chạy local migration + test**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && make migrate-up && "/mnt/c/Program Files/Go/bin/go.exe" test ./...`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_api/go.mod chidinh_api/go.sum chidinh_api/cmd/migrate chidinh_api/internal/platform/database chidinh_api/internal/app/bootstrap.go chidinh_api/Makefile docker-compose.yml
git commit -m "feat(api): add goose migrations and owner seed flow"
```

## Task 4: Hardening Config + CORS Local Correctness

**Files:**
- Modify: `chidinh_api/internal/platform/config/config.go`
- Modify: `chidinh_api/internal/platform/middleware/cors.go`
- Create: `chidinh_api/internal/platform/config/config_test.go`
- Create: `chidinh_api/internal/platform/middleware/cors_test.go`
- Modify: `chidinh_api/.env.example`

- [ ] **Step 1: Viết test fail cho strict CORS**

```go
func TestCORSRejectsUnknownOrigin(t *testing.T) {
    // allowed = http://localhost:5173
    // request origin khác => không set ACAO
}
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./internal/platform/middleware -v`
Expected: FAIL do hiện tại cho phép mọi origin khi list rỗng.

- [ ] **Step 3: Sửa CORS behavior**

```go
if origin == "" || !slices.Contains(allowedOrigins, origin) {
    // không set ACAO
}
```

- [ ] **Step 4: Sửa config validation local**

```go
func (c Config) Validate() error {
    // require DATABASE_URL, JWT_SECRET
    // require CORS_ALLOWED_ORIGINS non-empty cho APP_ENV=production
}
```

- [ ] **Step 5: Chạy test config + middleware**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./internal/platform/config ./internal/platform/middleware`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_api/internal/platform/config chidinh_api/internal/platform/middleware chidinh_api/.env.example
git commit -m "fix(api): harden config and strict cors origin handling"
```

## Task 5: Bổ sung Validator + Slog để bám stack docs

**Files:**
- Modify: `chidinh_api/go.mod`
- Modify: `chidinh_api/internal/modules/auth/handler.go`
- Modify: `chidinh_api/internal/modules/todo/handler.go`
- Create: `chidinh_api/internal/platform/validation/validator.go`
- Create: `chidinh_api/internal/platform/logger/logger.go`
- Modify: `chidinh_api/cmd/api/main.go`
- Modify: `chidinh_api/internal/platform/httpserver/router.go`

- [ ] **Step 1: Viết test fail cho payload validation**

```go
func TestCreateTodoRejectsTooLongTitle(t *testing.T) {
    // POST /api/v1/todos với title > 200
    // expect 400 bad_request
}
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./internal/modules/todo -v`
Expected: FAIL hoặc chưa có test route-level validation nhất quán.

- [ ] **Step 3: Thêm validator wrapper**

```go
type CreateTodoRequest struct {
    Title string `json:"title" validate:"required,max=200"`
}
```

- [ ] **Step 4: Thêm logger wrapper dùng slog**

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Info("server started", "port", cfg.Port)
```

- [ ] **Step 5: Gắn request logging middleware tối thiểu**

```go
logger.Info("http request", "method", r.Method, "path", r.URL.Path, "status", ww.status)
```

- [ ] **Step 6: Chạy test/backend build**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./... && "/mnt/c/Program Files/Go/bin/go.exe" build ./cmd/api`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_api/go.mod chidinh_api/go.sum chidinh_api/internal/modules/auth/handler.go chidinh_api/internal/modules/todo/handler.go chidinh_api/internal/platform/validation chidinh_api/internal/platform/logger chidinh_api/cmd/api/main.go chidinh_api/internal/platform/httpserver/router.go
git commit -m "feat(api): add validator and structured slog logging"
```

## Task 6: Mở rộng Backend Test Coverage theo docs

**Files:**
- Create: `chidinh_api/internal/modules/auth/service_test.go`
- Create: `chidinh_api/internal/platform/middleware/auth_test.go`
- Create: `chidinh_api/internal/modules/todo/service_test.go`
- Create: `chidinh_api/internal/modules/todo/handler_test.go`
- Modify: `chidinh_api/internal/platform/httpserver/router_test.go`

- [ ] **Step 1: Viết các test còn thiếu**

```go
func TestLoginSuccess(t *testing.T) {}
func TestLoginFailure(t *testing.T) {}
func TestAuthMiddlewareRejectsMissingCookie(t *testing.T) {}
func TestTodoCreateValidation(t *testing.T) {}
func TestTodoUpdateCompletion(t *testing.T) {}
func TestTodoDelete(t *testing.T) {}
```

- [ ] **Step 2: Chạy test để xác nhận FAIL ban đầu**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./...`
Expected: FAIL ở các case mới trước khi implement đầy đủ mock/deps.

- [ ] **Step 3: Hoàn thiện fixtures/mocks cần thiết**

```go
type fakeTodoRepo struct { /* list/create/update/delete stubs */ }
type fakeOwnerRepo struct { /* get by username/id stubs */ }
```

- [ ] **Step 4: Chạy full backend test**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./... -cover`
Expected: PASS, coverage tăng rõ ở auth/todo/middleware.

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_api/internal/modules/auth/service_test.go chidinh_api/internal/platform/middleware/auth_test.go chidinh_api/internal/modules/todo/service_test.go chidinh_api/internal/modules/todo/handler_test.go chidinh_api/internal/platform/httpserver/router_test.go
git commit -m "test(api): expand auth todo and middleware coverage"
```

## Task 7: Mở rộng Frontend Test Coverage (Auth + Protected Route + Todo)

**Files:**
- Create: `chidinh_client/src/test/auth.login.test.tsx`
- Create: `chidinh_client/src/test/auth.require-auth.test.tsx`
- Create: `chidinh_client/src/test/todo.page.test.tsx`
- Modify: `chidinh_client/src/test/setup.ts`
- Modify: `chidinh_client/package.json`

- [ ] **Step 1: Viết test fail cho login flow**

```tsx
it("submits login and navigates to /app on success", async () => {
  // mock /api/v1/auth/login + /api/v1/auth/me
});
```

- [ ] **Step 2: Viết test fail cho protected route redirect**

```tsx
it("redirects unauthenticated user to /login", async () => {
  // mock /api/v1/auth/me => 401
});
```

- [ ] **Step 3: Viết test fail cho todo create/toggle/delete**

```tsx
it("creates, toggles, and deletes todo items", async () => {
  // mock list/create/patch/delete
});
```

- [ ] **Step 4: Chạy test để xác nhận FAIL**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_client && npm test`
Expected: FAIL do thiếu mock/fetch orchestration.

- [ ] **Step 5: Bổ sung test utilities + fetch mock setup**

```ts
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
```

- [ ] **Step 6: Chạy full frontend test + build**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_client && npm test && npm run build`
Expected: PASS toàn bộ.

- [ ] **Step 7: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add chidinh_client/src/test chidinh_client/package.json chidinh_client/package-lock.json
git commit -m "test(client): add auth guard and todo interaction tests"
```

## Task 8: Local Runbook + Verification Checklist (No Deploy)

**Files:**
- Create: `docs/project/2026-03-31-mvp1-local-runbook.md`
- Modify: `docs/README.md`
- Modify: `docs/project/2026-03-31-mvp1-delivery-plan.md`

- [ ] **Step 1: Viết runbook local chuẩn hóa command**

```md
1) docker compose up -d db
2) make migrate-up
3) go run ./cmd/api
4) npm run dev
5) smoke test: login -> todo create/toggle/delete -> logout
```

- [ ] **Step 2: Thêm checklist pass/fail rõ ràng**

```md
- /health trả 200
- /api/v1/auth/me trả 401 khi chưa login
- login set cookie httpOnly
- todo CRUD persistent trên postgres
```

- [ ] **Step 3: Self-review tài liệu**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation && rg -n "TBD|TODO|later|placeholder" docs/project/2026-03-31-mvp1-local-runbook.md`
Expected: không có placeholder.

- [ ] **Step 4: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
git add docs/README.md docs/project/2026-03-31-mvp1-delivery-plan.md docs/project/2026-03-31-mvp1-local-runbook.md
git commit -m "docs: add local-first runbook and verification checklist"
```

## Final Verification Gate (Local)

- [ ] **Step 1: Backend tests**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api && "/mnt/c/Program Files/Go/bin/go.exe" test ./... -cover`
Expected: PASS.

- [ ] **Step 2: Frontend tests/build**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_client && npm test && npm run build`
Expected: PASS.

- [ ] **Step 3: Docker local smoke**

Run: `cd /mnt/d/chidinh/.worktrees/mvp1-foundation && docker compose up -d --build`
Expected: `db`, `backend`, `frontend` đều `Up`.

- [ ] **Step 4: Manual API smoke**

Run:
```bash
curl -i http://localhost:8080/health
curl -i -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"owner","password":"owner123"}' -c /tmp/cookies.txt
curl -i http://localhost:8080/api/v1/auth/me -b /tmp/cookies.txt
curl -i -X POST http://localhost:8080/api/v1/todos -H "Content-Type: application/json" -d '{"title":"local smoke"}' -b /tmp/cookies.txt
```
Expected: flow hoạt động end-to-end.

- [ ] **Step 5: Local-ready milestone**

Definition of done:
- Deploy vẫn chưa làm
- Tất cả chức năng MVP1 core chạy local ổn định
- Gap tài liệu (trừ deploy) đã được đóng

