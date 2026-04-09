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
SET type = CASE WHEN sqlc.arg(set_type) THEN sqlc.arg(type) ELSE type END,
    title = CASE WHEN sqlc.arg(set_title) THEN sqlc.arg(title) ELSE title END,
    image_url = CASE WHEN sqlc.arg(set_image_url) THEN sqlc.narg(image_url) ELSE image_url END,
    source_url = CASE WHEN sqlc.arg(set_source_url) THEN sqlc.narg(source_url) ELSE source_url END,
    review = CASE WHEN sqlc.arg(set_review) THEN sqlc.narg(review) ELSE review END,
    consumed_on = CASE WHEN sqlc.arg(set_consumed_on) THEN sqlc.arg(consumed_on) ELSE consumed_on END,
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
