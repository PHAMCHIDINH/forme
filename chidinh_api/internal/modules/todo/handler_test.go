package todo_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/httpserver"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
	"github.com/jackc/pgx/v5"
)

const owner123Hash = "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC"

func TestCreateRejectsBlankTitleOverHTTP(t *testing.T) {
	router := newTodoValidationRouter()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/todos/", bytes.NewBufferString(`{"title":"   "}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for blank title")
	}
	if resp.Error.Message != "title is required" {
		t.Fatalf("expected error message %q, got %q", "title is required", resp.Error.Message)
	}
}

func TestUpdateRejectsEmptyPayloadOverHTTP(t *testing.T) {
	router := newTodoValidationRouter()

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-123", bytes.NewBufferString(`{}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for empty update payload")
	}
	if resp.Error.Message != "at least one field is required" {
		t.Fatalf("expected error message %q, got %q", "at least one field is required", resp.Error.Message)
	}
}

func newTodoValidationRouter() http.Handler {
	cfg := config.Config{JWTSecret: "test-secret"}
	owner := db.Owner{
		ID:           "owner-123",
		Username:     "owner",
		PasswordHash: owner123Hash,
		DisplayName:  "Owner Name",
	}
	store := stubOwnerStore{
		ownersByUsername: map[string]db.Owner{
			owner.Username: owner,
		},
		ownersByID: map[string]db.Owner{
			owner.ID: owner,
		},
	}

	authService := auth.NewService(cfg, store)
	authMiddleware := middleware.NewAuth(authService)
	authHandler := auth.NewHandler(cfg, authService, validation.New())
	todoHandler := todo.NewHandler(todo.NewService(&todo.Repository{}), validation.New())

	return httpserver.NewRouter(cfg, nil, authHandler, todoHandler, authMiddleware)
}

func authCookie(t *testing.T) *http.Cookie {
	t.Helper()

	cfg := config.Config{JWTSecret: "test-secret"}
	owner := db.Owner{
		ID:           "owner-123",
		Username:     "owner",
		PasswordHash: owner123Hash,
		DisplayName:  "Owner Name",
	}
	service := auth.NewService(cfg, stubOwnerStore{
		ownersByUsername: map[string]db.Owner{
			owner.Username: owner,
		},
		ownersByID: map[string]db.Owner{
			owner.ID: owner,
		},
	})
	session, err := service.Login(context.Background(), "owner", "owner123")
	if err != nil {
		t.Fatalf("expected login token for test owner, got error: %v", err)
	}

	return &http.Cookie{
		Name:  auth.CookieName,
		Value: session.Token,
	}
}

type stubOwnerStore struct {
	ownersByUsername map[string]db.Owner
	ownersByID       map[string]db.Owner
}

func (s stubOwnerStore) GetOwnerByUsername(_ context.Context, username string) (db.Owner, error) {
	owner, ok := s.ownersByUsername[username]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}

	return owner, nil
}

func (s stubOwnerStore) GetOwnerByID(_ context.Context, id string) (db.Owner, error) {
	owner, ok := s.ownersByID[id]
	if !ok {
		return db.Owner{}, pgx.ErrNoRows
	}

	return owner, nil
}
