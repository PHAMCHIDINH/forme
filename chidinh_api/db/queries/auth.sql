-- name: GetOwnerByUsername :one
SELECT id, username, password_hash, display_name, created_at, updated_at
FROM owners
WHERE username = $1;

-- name: GetOwnerByID :one
SELECT id, username, password_hash, display_name, created_at, updated_at
FROM owners
WHERE id = $1;
