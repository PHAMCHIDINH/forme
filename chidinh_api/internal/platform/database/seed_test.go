package database

import (
	"context"
	"testing"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/jackc/pgx/v5"
)

func TestSeedLocalOwnerIsIdempotent(t *testing.T) {
	store := &stubOwnerSeedStore{}
	cfg := config.Config{
		OwnerUsername:     "owner",
		OwnerPasswordHash: "bcrypt-hash",
	}

	if err := SeedLocalOwner(context.Background(), store, cfg); err != nil {
		t.Fatalf("expected first seed to succeed, got error: %v", err)
	}
	if err := SeedLocalOwner(context.Background(), store, cfg); err != nil {
		t.Fatalf("expected second seed to succeed, got error: %v", err)
	}

	if store.upsertCalls != 1 {
		t.Fatalf("expected one upsert across repeated seeding, got %d", store.upsertCalls)
	}

	owner, ok := store.owners[localOwnerID]
	if !ok {
		t.Fatalf("expected local owner %q to be stored", localOwnerID)
	}
	if owner.Username != "owner" {
		t.Fatalf("expected username %q, got %q", "owner", owner.Username)
	}
	if owner.PasswordHash != "bcrypt-hash" {
		t.Fatalf("expected password hash %q, got %q", "bcrypt-hash", owner.PasswordHash)
	}
	if owner.DisplayName != "owner" {
		t.Fatalf("expected display name %q, got %q", "owner", owner.DisplayName)
	}
}

func TestSeedLocalOwnerReusesExistingUsernameRecord(t *testing.T) {
	store := &stubOwnerSeedStore{
		owners: map[string]db.Owner{
			"owner-123": {
				ID:           "owner-123",
				Username:     "owner",
				PasswordHash: "old-hash",
				DisplayName:  "Owner Name",
			},
		},
	}
	cfg := config.Config{
		OwnerUsername:     "owner",
		OwnerPasswordHash: "new-hash",
	}

	if err := SeedLocalOwner(context.Background(), store, cfg); err != nil {
		t.Fatalf("expected seed to update existing owner username, got error: %v", err)
	}

	if store.upsertCalls != 1 {
		t.Fatalf("expected one upsert for existing username record, got %d", store.upsertCalls)
	}
	if len(store.owners) != 1 {
		t.Fatalf("expected owner count %d, got %d", 1, len(store.owners))
	}

	owner, ok := store.owners["owner-123"]
	if !ok {
		t.Fatalf("expected existing owner id %q to be preserved", "owner-123")
	}
	if owner.PasswordHash != "new-hash" {
		t.Fatalf("expected password hash %q, got %q", "new-hash", owner.PasswordHash)
	}
	if owner.DisplayName != "owner" {
		t.Fatalf("expected display name %q, got %q", "owner", owner.DisplayName)
	}
}

type stubOwnerSeedStore struct {
	owners      map[string]db.Owner
	upsertCalls int
}

func (s *stubOwnerSeedStore) GetOwnerByID(_ context.Context, id string) (db.Owner, error) {
	if s.owners == nil {
		return db.Owner{}, pgx.ErrNoRows
	}

	owner, ok := s.owners[id]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}

	return owner, nil
}

func (s *stubOwnerSeedStore) GetOwnerByUsername(_ context.Context, username string) (db.Owner, error) {
	if s.owners == nil {
		return db.Owner{}, pgx.ErrNoRows
	}

	for _, owner := range s.owners {
		if owner.Username == username {
			return owner, nil
		}
	}

	return db.Owner{}, pgx.ErrNoRows
}

func (s *stubOwnerSeedStore) UpsertOwner(_ context.Context, owner db.Owner) error {
	if s.owners == nil {
		s.owners = make(map[string]db.Owner)
	}

	s.upsertCalls++
	s.owners[owner.ID] = owner

	return nil
}
