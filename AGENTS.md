# AGENTS.md

## Repository Overview

This repository is split into two runnable applications plus documentation:

- `chidinh_client`: React 19 + TypeScript + Vite frontend.
- `chidinh_api`: Go backend with migrations under `cmd/migrate` and API entrypoint under `cmd/api`.
- `docs`: product, architecture, technical notes, plans, and runbooks.
- `.github/workflows`: CI and deployment workflows.

Prefer changes that stay scoped to one side of the stack unless the task explicitly crosses frontend and backend boundaries.

## Dev Environment Tips

- From the repository root, `make dev` starts frontend and backend together.
- `make dev-frontend` runs the Vite frontend in `chidinh_client`.
- `make dev-backend` runs the Go API with `GOTMPDIR` pointed at `<repo>/.gotmp`.
- For a full local stack with PostgreSQL, use `docker compose up -d db`, run migrations from `chidinh_api`, then start services. The detailed sequence lives in `docs/project/2026-03-31-mvp1-local-runbook.md`.
- Frontend default local URL is `http://localhost:5173`.
- Backend default local URL is `http://localhost:8080`.
- PostgreSQL default local port is `5432`.

## Frontend Guidance

- Use `npm` for the frontend. Install and run commands from `chidinh_client`.
- Main scripts:
  - `npm run dev`
  - `npm test`
  - `npm run build`
- The frontend test runner is Vitest. Prefer focused runs while iterating, for example `npx vitest run src/test/<file>.test.tsx`, then finish with the full suite.
- Keep new frontend code in TypeScript.
- Follow the existing structure under `src/shared`, `src/features`, `src/pages`, and `src/test`.
- Do not commit generated frontend artifacts such as `dist/` unless the task explicitly requires them.

## Backend Guidance

- Use `go` from `chidinh_api` unless the task specifically uses the root `Makefile`.
- Main commands:
  - `make migrate-up`
  - `make test`
  - `make build`
  - `go run ./cmd/api`
- Run migrations before assuming the API is ready against a fresh database.
- When tests depend on PostgreSQL, align local environment variables with the runbook and CI workflow.

## Testing Instructions

- Frontend CI runs in `chidinh_client` with:
  - `npm ci`
  - `npm test`
  - `npm run build`
- Backend CI runs in `chidinh_api` with PostgreSQL available, then:
  - `go test ./...`
  - `go build ./cmd/api`
- Before finishing a code change, run the narrowest relevant test first, then the full package or app-level checks that match the touched area.
- If you change both frontend and backend behavior, test both sides.

## Documentation Instructions

- Repo planning and design documents live under `docs/`, especially `docs/superpowers/plans` and `docs/superpowers/specs`.
- When adding project documentation, keep filenames date-prefixed to match the existing convention.
- Prefer updating the relevant runbook or plan when behavior changes, instead of leaving knowledge only in code.

## PR Instructions

- Keep commits and patches narrowly scoped.
- Do not revert unrelated user changes in the working tree.
- Reference affected app areas clearly in commit messages and PR summaries, for example `frontend`, `backend`, or `docs`.
- Before opening a PR, make sure the same checks as CI pass for the code you changed.
- CI triggers on pushes to `main` and `codex/**`, and on pull requests targeting `main`.

## Agent Workflow Notes

- Start by checking `git status` because this repository may already contain in-progress user work.
- Prefer `rg` for file search and targeted inspection over broad scans.
- Read the relevant document in `docs/` before changing behavior that already has a spec, plan, or runbook.
- Keep edits minimal and consistent with existing patterns; avoid broad refactors unless they are required for the task.
