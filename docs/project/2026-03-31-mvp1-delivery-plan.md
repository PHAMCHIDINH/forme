# MVP 1 Delivery Plan

## 1. Objective

This delivery plan translates the MVP 1 requirements into a practical execution
sequence. The goal is to reduce integration risk by building the system in the
same order the architecture depends on.

## 2. Delivery Principles

- build vertical slices, not isolated code piles
- verify each layer before adding the next one
- keep auth and deployment concerns visible from the start
- avoid scope growth beyond the agreed MVP 1

## 3. Recommended Milestones

### Milestone 1: Foundation

Deliverables:

- frontend scaffold with routing
- backend scaffold with health endpoint
- shared environment configuration strategy
- local run commands documented
- local-first runbook and smoke checklist published

Exit criteria:

- both apps boot locally
- frontend can reach backend health endpoint
- local runbook smoke checklist passes on the same machine

### Milestone 2: Public Portfolio

Deliverables:

- landing page
- static project and profile data
- responsive layout

Exit criteria:

- public route is complete
- no backend dependency is required for portfolio content

### Milestone 3: Authentication and Dashboard Shell

Deliverables:

- login page
- JWT cookie auth
- protected route logic
- dashboard layout with sidebar and topbar

Exit criteria:

- owner can log in locally
- unauthenticated access to dashboard is blocked
- authenticated access reaches dashboard shell

### Milestone 4: Todo CRUD

Deliverables:

- PostgreSQL schema
- backend todo endpoints
- frontend todo page
- create, list, update, delete interactions

Exit criteria:

- todo data persists correctly
- UI reflects database changes correctly

### Milestone 5: Deployment and Release

Deliverables:

- Dockerfiles
- Vercel frontend deployment
- Railway backend deployment
- GitHub Actions CI/CD
- production smoke-test pass

Exit criteria:

- production environment is live
- release checklist passes end-to-end

## 4. Dependency Order

The recommended implementation order is:

1. project scaffolding
2. public portfolio
3. backend schema and auth service
4. frontend auth and protected routing
5. todo API
6. todo UI
7. Docker and CI/CD
8. production verification

## 5. Scope Guardrails

Do not add the following during MVP 1 unless a blocking issue requires it:

- note editor
- file upload
- search
- AI assistant
- portfolio admin UI
- user registration
- social login

## 6. Teaming Assumption

This plan assumes either:

- one engineer implementing sequentially
- or multiple engineers working with clear ownership splits between frontend,
  backend, and infrastructure docs/tasks

Suggested ownership split if parallelized:

- frontend: portfolio, routing, login UI, dashboard, todo UI
- backend: auth API, todo API, database, migrations
- platform: Docker, CI/CD, deploy verification

## 7. Verification Gates

Before moving to the next milestone, verify:

- tests exist for the completed slice
- local flows run successfully
- documentation stays aligned with implementation
- environment variables are recorded in `.env.example`
- local-first smoke checks are documented and repeatable without any deploy

## 8. Final MVP 1 Release Checklist

- PRD accepted
- architecture accepted
- API and database design accepted
- implementation plan accepted
- frontend tests passing
- backend tests passing
- production deploy successful
- smoke tests passing
