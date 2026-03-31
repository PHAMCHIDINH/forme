package auth

import (
	"context"
	"errors"
	"testing"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/jackc/pgx/v5"
)

const owner123Hash = "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC"

func TestLoginSuccessWithBcryptHash(t *testing.T) {
	store := &stubOwnerStore{
		ownersByUsername: map[string]db.Owner{
			"owner": {
				ID:           "owner-123",
				Username:     "owner",
				PasswordHash: owner123Hash,
				DisplayName:  "Owner Name",
			},
		},
	}

	service := NewService(config.Config{JWTSecret: "test-secret"}, store)

	session, err := service.Login(context.Background(), "owner", "owner123")
	if err != nil {
		t.Fatalf("expected login to succeed, got error: %v", err)
	}
	if session.User.ID != "owner-123" {
		t.Fatalf("expected user id %q, got %q", "owner-123", session.User.ID)
	}
	if session.User.Username != "owner" {
		t.Fatalf("expected username %q, got %q", "owner", session.User.Username)
	}
	if session.User.DisplayName != "Owner Name" {
		t.Fatalf("expected display name %q, got %q", "Owner Name", session.User.DisplayName)
	}

	claims, err := service.ParseToken(session.Token)
	if err != nil {
		t.Fatalf("expected token to parse, got error: %v", err)
	}
	if claims.Subject != "owner-123" {
		t.Fatalf("expected JWT subject %q, got %q", "owner-123", claims.Subject)
	}
	if claims.Username != "owner" {
		t.Fatalf("expected JWT username %q, got %q", "owner", claims.Username)
	}
}

func TestLoginRejectsInvalidCredentials(t *testing.T) {
	store := &stubOwnerStore{
		ownersByUsername: map[string]db.Owner{
			"owner": {
				ID:           "owner-123",
				Username:     "owner",
				PasswordHash: owner123Hash,
				DisplayName:  "Owner Name",
			},
		},
	}

	service := NewService(config.Config{JWTSecret: "test-secret"}, store)

	testCases := []struct {
		name     string
		username string
		password string
	}{
		{name: "wrong password", username: "owner", password: "wrong-password"},
		{name: "unknown username", username: "missing", password: "owner123"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := service.Login(context.Background(), tc.username, tc.password)
			if !errors.Is(err, ErrInvalidCredentials) {
				t.Fatalf("expected ErrInvalidCredentials, got %v", err)
			}
		})
	}
}

func TestCurrentUserReturnsDBOwnerIdentity(t *testing.T) {
	store := &stubOwnerStore{
		ownersByID: map[string]db.Owner{
			"owner-123": {
				ID:           "owner-123",
				Username:     "owner",
				PasswordHash: owner123Hash,
				DisplayName:  "Owner Name",
			},
		},
	}

	service := NewService(config.Config{JWTSecret: "test-secret"}, store)

	user, err := service.CurrentUser(context.Background(), "owner-123")
	if err != nil {
		t.Fatalf("expected current user lookup to succeed, got error: %v", err)
	}
	if user.ID != "owner-123" {
		t.Fatalf("expected user id %q, got %q", "owner-123", user.ID)
	}
	if user.Username != "owner" {
		t.Fatalf("expected username %q, got %q", "owner", user.Username)
	}
	if user.DisplayName != "Owner Name" {
		t.Fatalf("expected display name %q, got %q", "Owner Name", user.DisplayName)
	}
}

type stubOwnerStore struct {
	ownersByUsername map[string]db.Owner
	ownersByID       map[string]db.Owner
}

func (s *stubOwnerStore) GetOwnerByUsername(_ context.Context, username string) (db.Owner, error) {
	owner, ok := s.ownersByUsername[username]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}
	return owner, nil
}

func (s *stubOwnerStore) GetOwnerByID(_ context.Context, id string) (db.Owner, error) {
	owner, ok := s.ownersByID[id]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}
	return owner, nil
}
