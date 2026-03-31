# Personal Digital Hub MVP 1 Recommended Stack

## 1. Overview

This document defines the recommended technology stack for MVP 1 of the Personal
Digital Hub.

The stack is chosen to support:

- a fast public-facing frontend
- a secure private dashboard
- a clean split between frontend and backend
- a PostgreSQL-backed CRUD workflow
- a straightforward deployment path for MVP 1

## 2. Final Recommended Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Radix UI

### Backend

- Go
- `net/http`
- `chi`
- `pgx v5`
- `sqlc`
- `goose`
- `log/slog`
- `go-playground/validator/v10`

### Database

- PostgreSQL

### Deployment and Delivery

- Vercel for frontend hosting
- Railway for backend hosting
- GitHub Actions for CI/CD
- Docker for containerized builds and local parity

## 3. Frontend Stack Details

### React

React is used to build the entire frontend as a single modular application. It is
well-suited for a product that has both a public area and a private dashboard
with future room for additional modules.

Use cases in MVP 1:

- public portfolio page
- login page
- dashboard shell
- todo tool UI

### TypeScript

TypeScript improves maintainability and reduces avoidable UI and API integration
errors. It is especially useful as the project grows from a small MVP into a
larger modular frontend.

### Vite

Vite is the recommended frontend build tool because:

- it is fast in development
- it keeps setup light
- it fits a frontend-only React app well
- it does not add unnecessary full-stack runtime complexity

### React Router

React Router is used for:

- public route handling
- login route
- protected dashboard routes
- nested route rendering in the dashboard shell

### TanStack Query

TanStack Query is used for server-state management. It should handle:

- auth session fetch
- todo list fetch
- create/update/delete invalidation

This keeps API-backed state separate from local UI state.

### React Hook Form and Zod

This pair is recommended for:

- login form validation
- todo create form validation
- keeping form code concise and type-safe

### Tailwind CSS and Radix UI

This combination is recommended because it gives:

- fast UI composition
- enough control to build a distinct product look
- reusable primitives for dropdowns, dialogs, and accessible UI patterns

For MVP 1, this is a better fit than a large opinionated component framework
because the product will likely evolve into many custom internal tools.

## 4. Backend Stack Details

### Go

Go is used for the backend because it provides:

- strong performance
- simple deployment
- good support for HTTP APIs
- good concurrency support for future background jobs or integrations

### net/http

The backend should stay close to the Go standard library. `net/http` provides a
stable base without introducing unnecessary framework coupling.

### chi

`chi` is the recommended router because it works naturally with `net/http`,
supports route composition well, and fits a modular monolith structure.

Use cases in MVP 1:

- auth route group
- todo route group
- health route
- middleware chaining

### pgx v5

`pgx` is the recommended PostgreSQL driver and toolkit because it is mature,
performant, and aligned with PostgreSQL-specific usage.

### sqlc

`sqlc` should be used to generate type-safe Go code from SQL queries. This keeps
the backend SQL-first while reducing manual boilerplate and query mismatch risk.

### goose

`goose` is recommended for database migrations because it is simple, practical,
and sufficient for MVP 1 schema management.

### log/slog

`log/slog` provides structured logging using the standard Go ecosystem. It is
recommended for request logs, startup logs, and database or auth error context.

### validator

`go-playground/validator/v10` is recommended for request validation in auth and
todo payloads.

## 5. Database Stack Details

### PostgreSQL

PostgreSQL is the primary database for MVP 1 and future phases.

It is a strong fit because the product needs:

- structured relational data
- reliable transactions
- straightforward filtering and sorting
- future extensibility for search and additional modules

### Suggested PostgreSQL Features for Later

Not required in MVP 1, but compatible with future phases:

- built-in full-text search
- `pg_trgm` for fuzzy search
- `pgvector` for semantic search and embeddings

## 6. Deployment Stack Details

### Vercel

Vercel is recommended for the frontend because it gives:

- fast static asset delivery
- simple React/Vite deployment
- easy environment variable configuration
- clean production and preview workflows

### Railway

Railway is recommended for the backend because it gives:

- simple Go service deployment
- PostgreSQL-friendly hosting
- easy environment variable management
- a fast path to production for MVP 1

### GitHub Actions

GitHub Actions is the recommended CI/CD tool for:

- running frontend tests
- running backend tests
- building both applications
- triggering deployment automation from `main`

### Docker

Docker is recommended for:

- packaging frontend and backend builds
- local environment consistency
- deployment parity between local and hosted environments

## 7. Why This Stack Fits MVP 1

This stack is intentionally practical rather than maximal.

It is a good fit because it:

- keeps frontend and backend cleanly separated
- avoids premature microservice complexity
- supports secure auth and PostgreSQL-backed CRUD
- remains easy to deploy as an individual project
- leaves room to add future modules without rebuilding the foundation

## 8. Stack Summary Table

| Layer | Technology |
|---|---|
| Frontend framework | React |
| Frontend language | TypeScript |
| Frontend build tool | Vite |
| Routing | React Router |
| Server state | TanStack Query |
| Form handling | React Hook Form |
| Schema validation | Zod |
| UI styling | Tailwind CSS |
| UI primitives | Radix UI |
| Backend language | Go |
| HTTP layer | net/http |
| Router | chi |
| PostgreSQL driver | pgx v5 |
| SQL code generation | sqlc |
| Migrations | goose |
| Logging | log/slog |
| Validation | go-playground/validator/v10 |
| Database | PostgreSQL |
| Frontend deploy | Vercel |
| Backend deploy | Railway |
| CI/CD | GitHub Actions |
| Containerization | Docker |

## 9. Final Recommendation

The final recommended stack for MVP 1 is:

- Frontend: React + TypeScript + Vite + React Router + TanStack Query + React Hook Form + Zod + Tailwind CSS + Radix UI
- Backend: Go + net/http + chi + pgx + sqlc + goose + slog + validator
- Database: PostgreSQL
- Deployment: Vercel + Railway + GitHub Actions + Docker

This stack is the best balance for the current scope of Personal Digital Hub:
small enough to move quickly, but structured enough to support long-term
expansion.
