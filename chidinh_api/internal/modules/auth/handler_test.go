package auth_test

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
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

func TestLoginAndMeFlowReturnsAuthenticatedDBOwner(t *testing.T) {
	router := newAuthTestRouter()

	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(`{"username":"owner","password":"owner123"}`))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRec := httptest.NewRecorder()

	router.ServeHTTP(loginRec, loginReq)

	if loginRec.Code != http.StatusOK {
		t.Fatalf("expected login status %d, got %d", http.StatusOK, loginRec.Code)
	}

	var loginResp struct {
		Data struct {
			User auth.UserResponse `json:"user"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(loginRec.Body).Decode(&loginResp); err != nil {
		t.Fatalf("expected login response JSON, got error: %v", err)
	}
	if loginResp.Error != nil {
		t.Fatalf("expected login success, got error: %+v", *loginResp.Error)
	}
	if loginResp.Data.User.ID != "owner-123" {
		t.Fatalf("expected login user id %q, got %q", "owner-123", loginResp.Data.User.ID)
	}
	if loginResp.Data.User.Username != "owner" {
		t.Fatalf("expected login username %q, got %q", "owner", loginResp.Data.User.Username)
	}
	if loginResp.Data.User.DisplayName != "Owner Name" {
		t.Fatalf("expected login display name %q, got %q", "Owner Name", loginResp.Data.User.DisplayName)
	}

	cookies := loginRec.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatal("expected auth cookie to be set on login")
	}

	meReq := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	meReq.AddCookie(cookies[0])
	meRec := httptest.NewRecorder()

	router.ServeHTTP(meRec, meReq)

	if meRec.Code != http.StatusOK {
		t.Fatalf("expected me status %d, got %d", http.StatusOK, meRec.Code)
	}

	var meResp struct {
		Data struct {
			User auth.UserResponse `json:"user"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(meRec.Body).Decode(&meResp); err != nil {
		t.Fatalf("expected me response JSON, got error: %v", err)
	}
	if meResp.Error != nil {
		t.Fatalf("expected me success, got error: %+v", *meResp.Error)
	}
	if meResp.Data.User.ID != "owner-123" {
		t.Fatalf("expected me user id %q, got %q", "owner-123", meResp.Data.User.ID)
	}
	if meResp.Data.User.Username != "owner" {
		t.Fatalf("expected me username %q, got %q", "owner", meResp.Data.User.Username)
	}
}

func TestLoginRejectsInvalidPasswordOverHTTP(t *testing.T) {
	router := newAuthTestRouter()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(`{"username":"owner","password":"wrong-password"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for invalid credentials")
	}
	if resp.Error.Code != "unauthorized" {
		t.Fatalf("expected error code %q, got %q", "unauthorized", resp.Error.Code)
	}
}

func TestLoginRejectsMissingCredentialsOverHTTP(t *testing.T) {
	router := newAuthTestRouter()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(`{"username":"   ","password":"   "}`))
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
		t.Fatal("expected error response for missing credentials")
	}
	if resp.Error.Code != "bad_request" {
		t.Fatalf("expected error code %q, got %q", "bad_request", resp.Error.Code)
	}
	if resp.Error.Message != "username and password are required" {
		t.Fatalf("expected error message %q, got %q", "username and password are required", resp.Error.Message)
	}
}

func newAuthTestRouter() http.Handler {
	owner := db.Owner{
		ID:           "owner-123",
		Username:     "owner",
		PasswordHash: owner123Hash,
		DisplayName:  "Owner Name",
	}
	store := &stubOwnerStore{
		ownersByUsername: map[string]db.Owner{
			owner.Username: owner,
		},
		ownersByID: map[string]db.Owner{
			owner.ID: owner,
		},
	}

	cfg := config.Config{JWTSecret: "test-secret"}
	authService := auth.NewService(cfg, store)
	authHandler := auth.NewHandler(cfg, authService, validation.New())
	authMiddleware := middleware.NewAuth(authService)
	todoHandler := todo.NewHandler(todo.NewService(&todo.Repository{}), validation.New())
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))

	return httpserver.NewRouter(cfg, logger, authHandler, todoHandler, authMiddleware)
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
