-- name: ListJournalEntriesByOwner :many
SELECT id,
       owner_id,
       type,
       title,
       image_url,
       source_url,
       review,
       consumed_on,
       created_at,
       updated_at
FROM journal_entries
WHERE owner_id = sqlc.arg(owner_id)
ORDER BY consumed_on DESC, created_at DESC;

-- name: GetJournalEntryByIDAndOwner :one
SELECT id,
       owner_id,
       type,
       title,
       image_url,
       source_url,
       review,
       consumed_on,
       created_at,
       updated_at
FROM journal_entries
WHERE id = $1
  AND owner_id = $2;

-- name: CreateJournalEntry :one
INSERT INTO journal_entries (
    id,
    owner_id,
    type,
    title,
    image_url,
    source_url,
    review,
    consumed_on
)
VALUES (
    sqlc.arg(id),
    sqlc.arg(owner_id),
    sqlc.arg(type),
    sqlc.arg(title),
    sqlc.narg(image_url),
    sqlc.narg(source_url),
    sqlc.narg(review),
    sqlc.arg(consumed_on)
)
RETURNING id,
          owner_id,
          type,
          title,
          image_url,
          source_url,
          review,
          consumed_on,
          created_at,
          updated_at;

-- name: UpdateJournalEntry :one
UPDATE journal_entries
SET type = sqlc.arg(type),
    title = sqlc.arg(title),
    image_url = sqlc.narg(image_url),
    source_url = sqlc.narg(source_url),
    review = sqlc.narg(review),
    consumed_on = sqlc.arg(consumed_on),
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id)
  AND owner_id = sqlc.arg(owner_id)
RETURNING id,
          owner_id,
          type,
          title,
          image_url,
          source_url,
          review,
          consumed_on,
          created_at,
          updated_at;

-- name: DeleteJournalEntryByIDAndOwner :execrows
DELETE FROM journal_entries
WHERE id = $1
  AND owner_id = $2;
