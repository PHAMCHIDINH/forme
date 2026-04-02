-- +goose Up

ALTER TABLE todos
    ADD COLUMN description_html TEXT NOT NULL DEFAULT '',
    ADD COLUMN status TEXT NOT NULL DEFAULT 'todo',
    ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium',
    ADD COLUMN due_at TIMESTAMPTZ NULL,
    ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN completed_at TIMESTAMPTZ NULL,
    ADD COLUMN archived_at TIMESTAMPTZ NULL;

UPDATE todos
SET status = CASE WHEN completed THEN 'done' ELSE 'todo' END,
    completed_at = CASE WHEN completed THEN updated_at ELSE NULL END,
    description_html = '',
    priority = 'medium',
    tags = '{}',
    archived_at = NULL;

CREATE INDEX IF NOT EXISTS idx_todos_owner_archive_status_due
    ON todos (owner_id, archived_at, status, due_at);

CREATE INDEX IF NOT EXISTS idx_todos_tags_gin
    ON todos USING GIN (tags);
