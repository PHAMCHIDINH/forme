package database

import (
	"context"
	"errors"
	"fmt"

	dbqueries "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/jackc/pgx/v5"
)

const localOwnerID = "owner-local"

const upsertOwnerSQL = `
INSERT INTO owners (id, username, password_hash, display_name)
VALUES ($1, $2, $3, $4)
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    updated_at = NOW()
WHERE owners.username IS DISTINCT FROM EXCLUDED.username
   OR owners.password_hash IS DISTINCT FROM EXCLUDED.password_hash
   OR owners.display_name IS DISTINCT FROM EXCLUDED.display_name
`

type OwnerSeedStore interface {
	GetOwnerByID(ctx context.Context, id string) (dbqueries.Owner, error)
	GetOwnerByUsername(ctx context.Context, username string) (dbqueries.Owner, error)
	UpsertOwner(ctx context.Context, owner dbqueries.Owner) error
}

type ownerSeedStore struct {
	queries *dbqueries.Queries
	db      dbqueries.DBTX
}

func NewOwnerSeedStore(db dbqueries.DBTX) OwnerSeedStore {
	return &ownerSeedStore{
		queries: dbqueries.New(db),
		db:      db,
	}
}

func SeedLocalOwner(ctx context.Context, store OwnerSeedStore, cfg config.Config) error {
	owner := localOwner(cfg)

	current, err := store.GetOwnerByUsername(ctx, owner.Username)
	if err == nil {
		owner.ID = current.ID
		if sameOwnerSeed(current, owner) {
			return nil
		}
		if err := store.UpsertOwner(ctx, owner); err != nil {
			return fmt.Errorf("failed to upsert local owner seed: %w", err)
		}

		return nil
	}
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("failed to load local owner seed by username: %w", err)
	}

	current, err = store.GetOwnerByID(ctx, owner.ID)
	if err == nil && sameOwnerSeed(current, owner) {
		return nil
	}
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("failed to load local owner seed: %w", err)
	}
	if err := store.UpsertOwner(ctx, owner); err != nil {
		return fmt.Errorf("failed to upsert local owner seed: %w", err)
	}

	return nil
}

func localOwner(cfg config.Config) dbqueries.Owner {
	displayName := cfg.OwnerUsername
	if displayName == "" {
		displayName = "owner"
	}

	return dbqueries.Owner{
		ID:           localOwnerID,
		Username:     cfg.OwnerUsername,
		PasswordHash: cfg.OwnerPasswordHash,
		DisplayName:  displayName,
	}
}

func sameOwnerSeed(current dbqueries.Owner, expected dbqueries.Owner) bool {
	return current.ID == expected.ID &&
		current.Username == expected.Username &&
		current.PasswordHash == expected.PasswordHash &&
		current.DisplayName == expected.DisplayName
}

func (s *ownerSeedStore) GetOwnerByID(ctx context.Context, id string) (dbqueries.Owner, error) {
	return s.queries.GetOwnerByID(ctx, id)
}

func (s *ownerSeedStore) GetOwnerByUsername(ctx context.Context, username string) (dbqueries.Owner, error) {
	return s.queries.GetOwnerByUsername(ctx, username)
}

func (s *ownerSeedStore) UpsertOwner(ctx context.Context, owner dbqueries.Owner) error {
	if _, err := s.db.Exec(ctx, upsertOwnerSQL, owner.ID, owner.Username, owner.PasswordHash, owner.DisplayName); err != nil {
		return err
	}

	return nil
}
