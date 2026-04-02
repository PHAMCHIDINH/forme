-- name: ListTodosByOwner :many
SELECT id,
       owner_id,
       title,
       description_html,
       status,
       priority,
       due_at,
       tags,
       completed,
       completed_at,
       archived_at,
       created_at,
       updated_at
FROM todos
WHERE owner_id = sqlc.arg(owner_id)
  AND (
    sqlc.arg(view_name)::text = ''
    OR (
      sqlc.arg(view_name)::text = 'active'
      AND archived_at IS NULL
      AND status IN ('todo', 'in_progress')
    )
    OR (
      sqlc.arg(view_name)::text = 'completed'
      AND archived_at IS NULL
      AND status = 'done'
    )
    OR (
      sqlc.arg(view_name)::text = 'archived'
      AND archived_at IS NOT NULL
    )
  )
  AND (
    sqlc.arg(search)::text = ''
    OR title ILIKE '%' || sqlc.arg(search) || '%'
    OR description_html ILIKE '%' || sqlc.arg(search) || '%'
    OR EXISTS (
      SELECT 1
      FROM unnest(tags) AS tag
      WHERE tag ILIKE '%' || sqlc.arg(search) || '%'
    )
  )
  AND (
    sqlc.arg(tag)::text = ''
    OR sqlc.arg(tag) = ANY(tags)
  )
ORDER BY COALESCE(due_at, created_at) ASC, created_at DESC;

-- name: GetTodoByIDAndOwner :one
SELECT id,
       owner_id,
       title,
       description_html,
       status,
       priority,
       due_at,
       tags,
       completed,
       completed_at,
       archived_at,
       created_at,
       updated_at
FROM todos
WHERE id = $1
  AND owner_id = $2;

-- name: CreateTodo :one
INSERT INTO todos (
    id,
    owner_id,
    title,
    description_html,
    status,
    priority,
    due_at,
    tags,
    completed_at,
    archived_at,
    completed
)
VALUES (
    sqlc.arg(id),
    sqlc.arg(owner_id),
    sqlc.arg(title),
    sqlc.arg(description_html),
    sqlc.arg(status),
    sqlc.arg(priority),
    sqlc.arg(due_at),
    sqlc.arg(tags),
    sqlc.arg(completed_at),
    sqlc.arg(archived_at),
    CASE
        WHEN sqlc.arg(status)::text = 'done' THEN TRUE
        ELSE FALSE
    END
)
RETURNING id,
          owner_id,
          title,
          description_html,
          status,
          priority,
          due_at,
          tags,
          completed,
          completed_at,
          archived_at,
          created_at,
          updated_at;

-- name: UpdateTodo :one
UPDATE todos
SET title = sqlc.arg(title),
    description_html = sqlc.arg(description_html),
    status = sqlc.arg(status),
    priority = sqlc.arg(priority),
    due_at = sqlc.arg(due_at),
    tags = sqlc.arg(tags),
    completed_at = sqlc.arg(completed_at),
    archived_at = sqlc.arg(archived_at),
    completed = CASE
        WHEN sqlc.arg(status)::text = 'done' THEN TRUE
        ELSE FALSE
    END,
    updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id)
  AND owner_id = sqlc.arg(owner_id)
RETURNING id,
          owner_id,
          title,
          description_html,
          status,
          priority,
          due_at,
          tags,
          completed,
          completed_at,
          archived_at,
          created_at,
          updated_at;

-- name: DeleteTodoByIDAndOwner :execrows
DELETE FROM todos
WHERE id = $1
  AND owner_id = $2;
