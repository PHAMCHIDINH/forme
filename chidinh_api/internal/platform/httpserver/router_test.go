package httpserver

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
	"github.com/jackc/pgx/v5"
)

const owner123Hash = "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC"

func TestHealthRoute(t *testing.T) {
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	router := NewRouter(config.Config{}, logger, nil, nil, nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestUploadsRouteServesStaticFiles(t *testing.T) {
	original, err := os.Getwd()
	if err != nil {
		t.Fatalf("expected working directory, got error: %v", err)
	}
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatalf("expected to change working directory, got error: %v", err)
	}
	t.Cleanup(func() {
		_ = os.Chdir(original)
	})

	if err := os.MkdirAll(filepath.Join("uploads", "images"), 0o755); err != nil {
		t.Fatalf("expected uploads directory to be created, got error: %v", err)
	}
	if err := os.WriteFile(filepath.Join("uploads", "images", "cover.txt"), []byte("static upload"), 0o644); err != nil {
		t.Fatalf("expected static file to be written, got error: %v", err)
	}

	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	router := NewRouter(config.Config{JWTSecret: "test-secret"}, logger, testAuthHandler(), nil, nil, testAuthMiddleware())
	req := httptest.NewRequest(http.MethodGet, "/uploads/images/cover.txt", nil)
	req.AddCookie(testAuthCookie(t))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
	if body := rec.Body.String(); body != "static upload" {
		t.Fatalf("expected static file contents, got %q", body)
	}
}

func TestUploadsRouteRequiresAuth(t *testing.T) {
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	router := NewRouter(config.Config{JWTSecret: "test-secret"}, logger, testAuthHandler(), nil, nil, testAuthMiddleware())
	req := httptest.NewRequest(http.MethodGet, "/uploads/images/cover.txt", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func testAuthHandler() *auth.Handler {
	cfg := config.Config{JWTSecret: "test-secret"}
	store := testOwnerStoreWithOwner()
	return auth.NewHandler(cfg, auth.NewService(cfg, store), validation.New())
}

func testAuthMiddleware() *middleware.Auth {
	cfg := config.Config{JWTSecret: "test-secret"}
	return middleware.NewAuth(auth.NewService(cfg, testOwnerStoreWithOwner()))
}

func testAuthCookie(t *testing.T) *http.Cookie {
	t.Helper()

	cfg := config.Config{JWTSecret: "test-secret"}
	service := auth.NewService(cfg, testOwnerStoreWithOwner())
	session, err := service.Login(context.Background(), "owner", "owner123")
	if err != nil {
		t.Fatalf("expected auth cookie, got error: %v", err)
	}

	return &http.Cookie{Name: auth.CookieName, Value: session.Token}
}

type testOwnerStore struct {
	ownersByUsername map[string]db.Owner
	ownersByID       map[string]db.Owner
}

func testOwnerStoreWithOwner() testOwnerStore {
	owner := db.Owner{
		ID:           "owner-123",
		Username:     "owner",
		PasswordHash: owner123Hash,
		DisplayName:  "Owner Name",
	}

	return testOwnerStore{
		ownersByUsername: map[string]db.Owner{
			owner.Username: owner,
		},
		ownersByID: map[string]db.Owner{
			owner.ID: owner,
		},
	}
}

func (s testOwnerStore) GetOwnerByUsername(_ context.Context, username string) (db.Owner, error) {
	owner, ok := s.ownersByUsername[username]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}
	return owner, nil
}

func (s testOwnerStore) GetOwnerByID(_ context.Context, id string) (db.Owner, error) {
	owner, ok := s.ownersByID[id]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}
	return owner, nil
}
