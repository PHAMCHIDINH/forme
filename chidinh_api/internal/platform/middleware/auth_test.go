package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
)

func TestAuthMiddlewareRejectsMissingCookie(t *testing.T) {
	mw := NewAuth(auth.NewService(config.Config{JWTSecret: "test-secret"}, nil))
	nextCalled := false

	req := httptest.NewRequest(http.MethodGet, "/api/v1/todos/", nil)
	rec := httptest.NewRecorder()

	mw.Require(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
	if nextCalled {
		t.Fatal("expected middleware to stop the request")
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for missing cookie")
	}
	if resp.Error.Message != "authentication required" {
		t.Fatalf("expected error message %q, got %q", "authentication required", resp.Error.Message)
	}
}

func TestAuthMiddlewareRejectsInvalidCookie(t *testing.T) {
	mw := NewAuth(auth.NewService(config.Config{JWTSecret: "test-secret"}, nil))
	nextCalled := false

	req := httptest.NewRequest(http.MethodGet, "/api/v1/todos/", nil)
	req.AddCookie(&http.Cookie{Name: auth.CookieName, Value: "not-a-valid-token"})
	rec := httptest.NewRecorder()

	mw.Require(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
	if nextCalled {
		t.Fatal("expected middleware to stop the request")
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for invalid cookie")
	}
	if resp.Error.Message != "invalid authentication token" {
		t.Fatalf("expected error message %q, got %q", "invalid authentication token", resp.Error.Message)
	}
}
