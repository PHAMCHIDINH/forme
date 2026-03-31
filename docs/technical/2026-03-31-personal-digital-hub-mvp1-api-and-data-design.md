# Personal Digital Hub MVP 1 API and Data Design

## 1. Technical Scope

This document defines the API and PostgreSQL design required for MVP 1.

Covered areas:

- authentication endpoints
- todo endpoints
- request and response formats
- PostgreSQL schema
- validation and error handling expectations

## 2. API Conventions

### 2.1 Base Path

All backend APIs are versioned under:

```text
/api/v1
```

### 2.2 Content Type

- request body: `application/json`
- response body: `application/json`

### 2.3 Auth Transport

Authentication is cookie-based. The browser sends the auth cookie automatically
for requests made with credentials enabled.

Frontend fetch requirements:

- send `credentials: "include"` on authenticated requests

### 2.4 Response Envelope

Use a consistent JSON structure.

Success response:

```json
{
  "data": {},
  "error": null
}
```

Error response:

```json
{
  "data": null,
  "error": {
    "code": "unauthorized",
    "message": "Authentication required"
  }
}
```

## 3. Authentication API

### 3.1 POST /api/v1/auth/login

Purpose:
- authenticate the owner and create a session cookie

Request:

```json
{
  "username": "owner",
  "password": "plain-text-password"
}
```

Success response:

```json
{
  "data": {
    "user": {
      "id": "owner",
      "username": "owner",
      "displayName": "Owner"
    }
  },
  "error": null
}
```

Failure cases:

- `400 bad_request` for invalid payload
- `401 unauthorized` for invalid credentials

### 3.2 GET /api/v1/auth/me

Purpose:
- validate current session and return owner identity

Success response:

```json
{
  "data": {
    "user": {
      "id": "owner",
      "username": "owner",
      "displayName": "Owner"
    }
  },
  "error": null
}
```

Failure:
- `401 unauthorized`

### 3.3 POST /api/v1/auth/logout

Purpose:
- clear the auth cookie

Success response:

```json
{
  "data": {
    "success": true
  },
  "error": null
}
```

## 4. Todo API

### 4.1 Todo Resource Shape

```json
{
  "id": "01JXXXXXXX",
  "title": "Ship MVP 1 docs",
  "completed": false,
  "createdAt": "2026-03-31T19:00:00Z",
  "updatedAt": "2026-03-31T19:00:00Z"
}
```

### 4.2 GET /api/v1/todos

Purpose:
- list all todo items for the owner

Success response:

```json
{
  "data": {
    "items": [
      {
        "id": "01JXXXXXXX",
        "title": "Ship MVP 1 docs",
        "completed": false,
        "createdAt": "2026-03-31T19:00:00Z",
        "updatedAt": "2026-03-31T19:00:00Z"
      }
    ]
  },
  "error": null
}
```

### 4.3 POST /api/v1/todos

Purpose:
- create a new todo item

Request:

```json
{
  "title": "Finish dashboard shell"
}
```

Validation:

- `title` is required
- trim leading and trailing whitespace
- minimum length after trim: 1
- maximum length: 200

Success response:

```json
{
  "data": {
    "item": {
      "id": "01JXXXXXXX",
      "title": "Finish dashboard shell",
      "completed": false,
      "createdAt": "2026-03-31T19:00:00Z",
      "updatedAt": "2026-03-31T19:00:00Z"
    }
  },
  "error": null
}
```

### 4.4 PATCH /api/v1/todos/:id

Purpose:
- update a todo item

Allowed fields:

- `title`
- `completed`

Request example:

```json
{
  "completed": true
}
```

Validation:

- at least one mutable field must be provided
- `title`, if present, must pass the same validation as create

Success response:

```json
{
  "data": {
    "item": {
      "id": "01JXXXXXXX",
      "title": "Finish dashboard shell",
      "completed": true,
      "createdAt": "2026-03-31T19:00:00Z",
      "updatedAt": "2026-03-31T19:05:00Z"
    }
  },
  "error": null
}
```

Failure cases:

- `400 bad_request`
- `404 not_found`

### 4.5 DELETE /api/v1/todos/:id

Purpose:
- delete a todo item

Success response:

```json
{
  "data": {
    "success": true
  },
  "error": null
}
```

Failure:
- `404 not_found`

## 5. Error Codes

Recommended API error codes:

- `bad_request`
- `unauthorized`
- `forbidden`
- `not_found`
- `conflict`
- `internal_error`

## 6. PostgreSQL Schema

### 6.1 Design Notes

Although MVP 1 has only one owner, schema design should avoid hardcoding todo
records as globally ownerless. This preserves a clean path to future expansion.

### 6.2 Tables

#### owners

Purpose:
- represent the single owner account

Suggested columns:

```sql
CREATE TABLE owners (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### todos

Purpose:
- store authenticated todo items

Suggested columns:

```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Indexes:

```sql
CREATE INDEX idx_todos_owner_created_at
    ON todos (owner_id, created_at DESC);
```

## 7. Migration Strategy

Migration set for MVP 1:

1. create `owners`
2. create `todos`
3. seed or insert owner record outside public registration flow

Owner seeding options:

- one-time SQL seed
- startup bootstrap logic guarded by environment checks
- manual admin SQL during deployment

Preferred MVP option:
- one-time startup seed or migration seed if the owner does not exist

## 8. SQLC Query Design

Suggested query groups:

`db/queries/auth.sql`
- get owner by username
- get owner by id

`db/queries/todos.sql`
- list todos by owner
- create todo
- update todo fields
- delete todo by id and owner
- get todo by id and owner

## 9. Backend Validation Rules

### Login

- reject empty username
- reject empty password

### Todo Create

- reject empty title after trim
- reject title over 200 characters

### Todo Update

- reject empty JSON body
- reject invalid field types
- reject empty title after trim when title provided

## 10. Security Requirements

- JWT secret must be loaded from environment configuration
- auth cookies must be `HttpOnly`
- production cookies must be `Secure`
- CORS must allow only the frontend origin
- backend must never trust frontend route protection as a security boundary
- password hashes must not be stored in plaintext in the database

## 11. Testing Scope

Backend tests should cover:

- login success
- login failure
- auth middleware rejects missing or invalid cookies
- todo create validation
- todo list returns expected records
- todo completion updates correctly
- todo delete removes the record

Frontend tests should cover:

- login form submission flow
- protected route redirect behavior
- todo list rendering
- todo create action
- todo toggle action
- todo delete action
