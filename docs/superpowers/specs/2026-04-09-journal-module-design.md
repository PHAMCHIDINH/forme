# Journal Module Design

## Goal

Add a new private dashboard module named `Journal` so the owner can keep a simple watch/read diary inside the app. Each journal entry should let the owner record a book or video with poster/cover image, title, source link, review text, and consumed date.

The module should feel like a first-class sibling to `Todo`, not a temporary extension of the todo domain.

## Scope

In scope:

- New authenticated dashboard route at `/app/journal`
- Sidebar navigation entry for `Journal`
- Frontend journal page with create, list, edit, and delete flows
- Backend journal CRUD module
- Database table and migration for journal entries
- Image support through either direct image URL entry or local image upload
- Validation and focused tests for the new vertical slice

Out of scope:

- Search and filtering
- Separate book and video sub-pages
- Ratings, tags, favorites, or status tracking
- Rich text editing
- Multiple images per entry
- Metadata scraping from URLs
- Uploading book/video files or storing book content
- Single-entry GET endpoint (`GET /api/v1/journal/{entryID}`) — not needed in v1 because the UI operates on the full list
- Object storage or CDN for uploaded images — v1 uses local server storage only
- Orphan file cleanup for uploads that were initiated but not saved

## Design Intent

The feature is a lightweight diary, not a media library manager. The owner should be able to add an entry quickly, see a visual list of what has been watched or read, and correct or remove entries whenever needed.

The first version should optimize for:

- low-friction entry creation
- obvious visual scanning through poster/cover cards
- minimal but durable data structure
- reuse of existing app shell and CRUD patterns

## Chosen Approach

Implement `Journal` as a new vertical slice across frontend, backend, and database.

Why this approach:

- It matches the current modular-monolith structure already used by `Todo`.
- It keeps the journal domain clean instead of overloading todo fields.
- It gives the feature durable persistence and clean room for future expansion.

Rejected alternatives:

- Extending `Todo`: faster short term, but wrong domain and poor long-term maintainability.
- Frontend-only local storage: simpler initially, but breaks the app's persistence model and loses cross-device durability.

## User Experience

### Primary flow

1. Owner opens `/app/journal`.
2. Owner fills in the journal form:
   - type: `Book` or `Video`
   - title
   - consumed date
   - source link
   - review
   - image by either upload or external URL
3. Owner saves the entry.
4. The new entry appears in the journal list as a card with poster/cover, metadata, and actions.

### Edit flow

1. Owner clicks `Edit` on a journal card.
2. The page form is populated with the selected entry.
3. Owner updates fields and saves.
4. The list refreshes and the edited card reflects the change.

### Delete flow

1. Owner clicks `Delete` on a journal card.
2. UI asks for a simple confirmation.
3. On confirm, the card is removed and the backend record is deleted.

## Frontend Design

### Routing and navigation

- Add `APP_ROUTES.journal = "/app/journal"`.
- Register a new nested dashboard route under `DashboardLayout`.
- Add `Journal` to the dashboard shell navigation.

### Module structure

Create a new frontend module:

```text
chidinh_client/src/modules/journal/
  api.ts
  JournalPage.tsx
  JournalForm.tsx
  JournalList.tsx
  journalTypes.ts
  journalFormState.ts
```

The page should follow the same broad composition used by `TodoPage`:

- page heading and supporting copy
- create/edit form near the top
- list of existing entries below
- empty state when no entries exist

### Entry form

Fields:

- `type` required
- `title` required
- `consumedOn` required
- `sourceUrl` optional, URL validation when present
- `review` optional, plain textarea
- image input required only if the user wants a poster/cover for that entry

Image input behavior:

- The form offers two modes: `Upload file` and `Paste image URL`.
- Only one source is active at a time.
- If upload mode is used, the file is sent to the upload endpoint first and the returned URL becomes the value saved in `imageUrl`.
- If URL mode is used, the entered URL is saved directly in `imageUrl`.

Edit behavior:

- The same form handles create and edit.
- Editing loads entry values into form state.
- Canceling edit returns the form to create mode.

### Journal list

Render entries as vertically stacked cards or tiles with:

- poster/cover thumbnail when `imageUrl` exists
- title
- type badge
- consumed date
- source link if present
- review text if present
- `Edit` and `Delete` actions

The list should prefer straightforward readability over dense data tables because the feature is diary-like and visual.

## Backend Design

### Module structure

Create a new backend module mirroring the todo slice:

```text
chidinh_api/internal/modules/journal/
  handler.go
  service.go
  repository.go
  types.go
  handler_test.go
  service_test.go
  repository_test.go
```

The module should be wired into the main router as a separate authenticated resource.

### API

- `GET /api/v1/journal` — returns all entries ordered by `consumed_on` DESC, then `created_at` DESC
- `POST /api/v1/journal`
- `PATCH /api/v1/journal/{entryID}` — partial update; backend must reject an empty body
- `DELETE /api/v1/journal/{entryID}`
- `POST /api/v1/uploads/images`

The journal CRUD endpoints require authenticated owner access, matching current private app behavior.

### Image uploads

The upload endpoint exists to support local file selection from the frontend.

Behavior:

- accept multipart form uploads
- validate that the uploaded file is an image
- store the file under `./uploads/images/` on the server, served as static files at `/uploads/images/<filename>`
- return a URL in the form `/uploads/images/<filename>` that the frontend can persist as `imageUrl`

This design keeps the journal record simple because the journal table only stores the resolved image URL. It does not need separate fields for uploaded-vs-remote image source in v1.

Known v1 limitation: if the user uploads a file and then abandons the form without saving, the uploaded file becomes an orphan on disk. Cleanup is deferred to a future version.

## Data Model

Add a new `journal_entries` table.

Columns:

- `id`
- `owner_id`
- `type`
- `title`
- `image_url`
- `source_url`
- `review`
- `consumed_on`
- `created_at`
- `updated_at`

Notes:

- `type` is constrained to `book` or `video`
- `title` is required
- `consumed_on` is required
- `image_url`, `source_url`, and `review` are optional
- `owner_id` preserves the existing owner-scoped data model even though the current app has one owner account

## Validation Rules

Frontend and backend should align on the same contract:

- `type` must be `book` or `video`
- `title` is required after trimming whitespace
- `title` should cap at 200 characters
- `consumedOn` is required
- `sourceUrl` is optional; must be a valid URL when present
- `imageUrl` is optional; must be a valid URL when present
- `review` is optional; no format constraints
- upload endpoint must reject non-image files

Patch/update validation should require at least one field, following the existing `Todo` pattern.

## Error Handling

Frontend:

- show field-level validation for required values and invalid URLs
- show a form-level error when create/update/delete fails
- disable final save while an image upload is still in flight
- use a simple confirmation before delete

Backend:

- return `400` for validation failures
- return `404` when updating or deleting a missing entry
- return `500` for storage or persistence failures

Upload failures should not create partial journal entries automatically. The owner should either retry upload or switch to URL mode before saving.

## Testing Strategy

### Frontend

Add focused tests for:

- router integration for `/app/journal`
- dashboard navigation showing the new journal route
- journal page empty state
- create flow
- edit flow
- delete flow
- image mode switching between upload and URL entry

### Backend

Add tests for:

- handler request validation and response codes
- service normalization and validation rules
- repository CRUD behavior
- upload endpoint validation for image vs non-image input

## Documentation Impact

Update existing architecture documentation so the private dashboard module list no longer implies that `Todo` is the only active private content module.

If the local runbook needs explicit upload notes for development, add a short journal/upload smoke step there after implementation.

## Implementation Boundaries

Expected frontend touch points:

- `chidinh_client/src/app/router/routes.ts`
- `chidinh_client/src/app/router/AppRouter.tsx`
- `chidinh_client/src/modules/dashboard/shellNav.ts`
- new files under `chidinh_client/src/modules/journal/`
- new frontend tests under `chidinh_client/src/test/`

Expected backend touch points:

- router/bootstrap wiring for the new module
- new files under `chidinh_api/internal/modules/journal/`
- new migration under `chidinh_api/db/migrations/`
- new SQL query file under `chidinh_api/db/queries/`
- generated `sqlc` artifacts after query/schema updates

## Open Decisions Resolved For V1

The following decisions are fixed for v1 and should not be reopened during implementation unless a hard blocker appears:

- one combined journal page, not split book/video pages
- CRUD included in v1
- consumed date included in v1
- image input supports both upload and direct URL
- only poster/cover image is stored, never book/video file content
- no filtering or search in v1
