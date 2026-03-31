# MVP 1 Local Runbook

## 1. Purpose

This runbook is the local-first execution path for MVP 1.
It covers a single-machine loop only:

- backend
- frontend
- PostgreSQL
- smoke verification

Do not use this runbook for deployment work.

## 2. Local Topology

Default local services:

- PostgreSQL: `localhost:5432`
- backend API: `http://localhost:8080`
- frontend app: `http://localhost:5173`

The frontend calls the API with credentials included, so cookie auth must work
between the browser and the backend.

## 3. Prerequisites

Install or verify:

- Docker and Docker Compose
- Node.js 18+ and npm
- Go toolchain used by this repo
- `curl`

The current backend make targets use the Windows Go binary path
`/mnt/c/Program Files/Go/bin/go.exe` when run from WSL. If your machine uses a
different Go path, adjust the command accordingly.

## 4. Environment Setup

Backend environment values for local execution are captured in:

- [`chidinh_api/.env.example`](/mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api/.env.example)

Recommended local values:

- `APP_ENV=development`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/pdh?sslmode=disable`
- `JWT_SECRET=change-me`
- `OWNER_USERNAME=owner`
- `OWNER_PASSWORD_HASH=<bcrypt hash>`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`
- `COOKIE_SECURE=false`
- `COOKIE_SAME_SITE=Lax`

Note: the Compose-friendly example file escapes bcrypt dollar signs with
`$$`. If you export the value manually outside Docker Compose, use the literal
hash from the auth tests instead of the escaped form.

Frontend local API base:

- `VITE_API_BASE_URL=http://localhost:8080`

## 5. Start The Stack

From the repo root:

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation
docker compose up -d --build
```

This starts:

- `db`
- `backend`
- `frontend`

If you need a clean restart, stop the stack first and remove the persisted
database volume only when you explicitly want a fresh local database.

## 6. Build And Test Commands

Run these before smoke testing:

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_api
"/mnt/c/Program Files/Go/bin/go.exe" test ./...
"/mnt/c/Program Files/Go/bin/go.exe" build ./...
```

```bash
cd /mnt/d/chidinh/.worktrees/mvp1-foundation/chidinh_client
npm ci
npm test
npm run build
```

## 7. Smoke Checklist

Use a cookie jar so the auth session survives across requests.

```bash
API=http://localhost:8080
COOKIE_JAR="$(mktemp)"

curl -fsS "$API/health"

curl -i -c "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"owner123"}' \
  "$API/api/v1/auth/login"

curl -fsS -b "$COOKIE_JAR" "$API/api/v1/auth/me"

TODO_ID="$(
  curl -fsS -b "$COOKIE_JAR" \
    -H "Content-Type: application/json" \
    -d '{"title":"local smoke todo"}' \
    "$API/api/v1/todos" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["item"]["id"])'
)"

curl -fsS -b "$COOKIE_JAR" "$API/api/v1/todos"

curl -fsS -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"completed":true}' \
  "$API/api/v1/todos/$TODO_ID"

curl -fsS -b "$COOKIE_JAR" \
  -X DELETE \
  "$API/api/v1/todos/$TODO_ID"

curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$API/api/v1/auth/logout"

curl -i -b "$COOKIE_JAR" "$API/api/v1/auth/me"
curl -i -b "$COOKIE_JAR" "$API/api/v1/todos"
```

Expected results:

- `/health` returns `200` and `ok`
- login returns `200` and sets the auth cookie
- `/api/v1/auth/me` returns the current user while logged in
- todo create returns `201`
- todo list returns the new item
- todo toggle returns `200` with the updated item
- todo delete returns `200`
- logout returns `200`
- post-logout `/api/v1/auth/me` and `/api/v1/todos` return `401`

## 8. Logout Guard Check

After login, open the frontend at `http://localhost:5173/app`.

Expected behavior:

- unauthenticated access redirects to `/login`
- authenticated access reaches the dashboard shell
- after logout, revisiting `/app` redirects back to `/login`

## 9. Troubleshooting

If the stack does not behave as expected:

- confirm the backend is using the same `DATABASE_URL` as the database service
- confirm `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`
- confirm the cookie is not marked secure for local HTTP
- confirm the backend and frontend are both pointed at the local API, not a deployed URL
- confirm no other process is already using ports `5432`, `8080`, or `5173`
- if Compose warns about an unescaped bcrypt hash, use the escaped value from
  `chidinh_api/.env.example`
