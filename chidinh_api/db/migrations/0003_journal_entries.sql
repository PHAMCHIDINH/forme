-- +goose Up

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('book', 'video')),
    title TEXT NOT NULL,
    image_url TEXT NULL,
    source_url TEXT NULL,
    review TEXT NULL,
    consumed_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_owner_consumed_created
    ON journal_entries (owner_id, consumed_on DESC, created_at DESC);
