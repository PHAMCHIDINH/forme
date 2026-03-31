-- name: ListTodosByOwner :many
SELECT id, owner_id, title, completed, created_at, updated_at
FROM todos
WHERE owner_id = $1
ORDER BY created_at DESC;

-- name: GetTodoByIDAndOwner :one
SELECT id, owner_id, title, completed, created_at, updated_at
FROM todos
WHERE id = $1
  AND owner_id = $2;

-- name: CreateTodo :one
INSERT INTO todos (id, owner_id, title, completed)
VALUES ($1, $2, $3, false)
RETURNING id, owner_id, title, completed, created_at, updated_at;

-- name: UpdateTodo :one
UPDATE todos
SET title = $3,
    completed = $4,
    updated_at = $5
WHERE id = $1
  AND owner_id = $2
RETURNING id, owner_id, title, completed, created_at, updated_at;

-- name: DeleteTodoByIDAndOwner :execrows
DELETE FROM todos
WHERE id = $1
  AND owner_id = $2;
