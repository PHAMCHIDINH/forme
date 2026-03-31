package database

import (
	"strings"
	"testing"
)

func TestEnsureSchemaSQLIncludesOwnersAndCascadingTodoFK(t *testing.T) {
	schema := schemaSQL

	if schema == "" {
		t.Fatal("schemaSQL must not be empty")
	}
	if want := "CREATE TABLE IF NOT EXISTS owners"; !strings.Contains(schema, want) {
		t.Fatalf("schemaSQL missing owners table DDL: %q", want)
	}
	if want := "owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE"; !strings.Contains(schema, want) {
		t.Fatalf("schemaSQL missing cascading owner FK: %q", want)
	}
	if want := "CREATE INDEX IF NOT EXISTS idx_todos_owner_created_at"; !strings.Contains(schema, want) {
		t.Fatalf("schemaSQL missing owner todo index: %q", want)
	}
}
