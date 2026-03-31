# MVP 1 Deploy Runbook

## 1. Purpose

This runbook defines how MVP 1 should be configured, deployed, and verified in
production.

Deployment split:

- frontend on Vercel
- backend on Railway
- PostgreSQL connected to the backend

## 2. Environments

Recommended environments for MVP 1:

- local
- production

Optional later:

- preview
- staging

## 3. Frontend Deployment on Vercel

### 3.1 Root Directory

Set project root to:

```text
chidinh_client
```

### 3.2 Build Settings

- framework preset: Vite
- install command: `npm ci`
- build command: `npm run build`
- output directory: `dist`

### 3.3 Environment Variables

Required:

```text
VITE_API_BASE_URL=https://<railway-backend-domain>
```

### 3.4 Domain Behavior

The frontend is public at the root domain or the chosen Vercel subdomain.

Public routes:

- `/`

Private routes:

- `/login`
- `/app`
- `/app/todo`

## 4. Backend Deployment on Railway

### 4.1 Root Directory

Set service root to:

```text
chidinh_api
```

### 4.2 Build Strategy

Choose one of:

- native Go build on Railway
- Dockerfile build

For MVP 1, Dockerfile-based deployment is acceptable if it matches local
development and CI behavior.

### 4.3 Required Environment Variables

```text
APP_ENV=production
PORT=8080
DATABASE_URL=postgres://...
JWT_SECRET=<strong-random-secret>
OWNER_USERNAME=<owner-username>
OWNER_PASSWORD_HASH=<bcrypt-or-argon2-hash>
CORS_ALLOWED_ORIGINS=https://<vercel-domain>
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
```

### 4.4 Railway Networking Notes

- ensure the service listens on `0.0.0.0:$PORT`
- ensure PostgreSQL connectivity from the Railway service is working
- ensure the deployed frontend origin is included in allowed CORS origins

## 5. PostgreSQL Setup

### 5.1 Required Schema

Before the app is considered healthy in production:

- `owners` table exists
- `todos` table exists
- owner seed record exists

### 5.2 Migration Order

1. run initial schema migration
2. create or seed owner record
3. verify todo queries work

## 6. Authentication and Cookie Setup

Because frontend and backend are deployed on different origins, cookie behavior is
the most sensitive part of the release.

Production requirements:

- auth cookie is `HttpOnly`
- auth cookie is `Secure`
- CORS allows credentials
- frontend sends requests with credentials included
- cookie `SameSite` is compatible with the chosen domain topology

If cross-site cookies do not work reliably in the selected domain configuration,
use a reverse proxy or aligned domain strategy before widening MVP scope.

## 7. CI/CD Expectations

### 7.1 CI Workflow

CI should:

- install dependencies
- run frontend tests
- run backend tests
- build frontend
- build backend
- optionally build Docker images

### 7.2 Deploy Workflow

Deploy should trigger on `main` only after CI success.

Recommended production deploy order:

1. deploy backend
2. verify health endpoint
3. verify auth session endpoint
4. deploy frontend
5. verify public page and private login flow

## 8. Smoke Test Checklist

After each production deploy:

- open public portfolio and verify content renders
- verify GitHub and contact links are correct
- submit valid owner login
- verify redirect to dashboard
- create a todo item
- toggle completion state
- delete the todo item
- logout and verify access to `/app` is blocked afterward

## 9. Failure Recovery

If deployment fails:

- rollback frontend to previous Vercel deployment
- rollback backend to previous Railway deployment
- inspect CI logs
- inspect backend startup logs
- verify environment variables
- verify database connectivity

If login fails in production:

- check `JWT_SECRET`
- check `OWNER_USERNAME`
- check password hash format
- check cookie flags
- check CORS credentials settings

If todo operations fail:

- verify migrations have run
- verify owner seed exists
- verify `DATABASE_URL`
- inspect SQL and backend logs

## 10. Release Approval Checklist

MVP 1 can be considered production-ready when:

- CI passes on `main`
- backend health endpoint returns success
- login works from the Vercel frontend against the Railway backend
- cookie-based auth works across deployed origins
- todo CRUD works against production PostgreSQL
- logout clears access correctly
