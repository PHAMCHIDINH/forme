package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSAllowsOnlyExplicitOrigins(t *testing.T) {
	t.Run("allowed origin gets CORS headers", func(t *testing.T) {
		served := false
		handler := CORS([]string{"http://localhost:5173"})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			served = true
			w.WriteHeader(http.StatusOK)
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "http://localhost:5173")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if !served {
			t.Fatal("expected downstream handler to run for allowed origin")
		}
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
			t.Fatalf("expected ACAO header for allowed origin, got %q", got)
		}
		if got := rec.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
			t.Fatalf("expected credentials header for allowed origin, got %q", got)
		}
	})

	t.Run("unknown origin gets no CORS headers", func(t *testing.T) {
		served := false
		handler := CORS([]string{"http://localhost:5173"})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			served = true
			w.WriteHeader(http.StatusOK)
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "http://evil.example")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if !served {
			t.Fatal("expected downstream handler to run for unknown origin requests")
		}
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "" {
			t.Fatalf("expected no ACAO header for unknown origin, got %q", got)
		}
		if got := rec.Header().Get("Access-Control-Allow-Credentials"); got != "" {
			t.Fatalf("expected no credentials header for unknown origin, got %q", got)
		}
	})

	t.Run("empty allowlist does not allow every origin", func(t *testing.T) {
		served := false
		handler := CORS(nil)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			served = true
			w.WriteHeader(http.StatusOK)
		}))

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "http://localhost:5173")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if !served {
			t.Fatal("expected downstream handler to run when allowlist is empty")
		}
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "" {
			t.Fatalf("expected empty allowlist to emit no ACAO header, got %q", got)
		}
		if got := rec.Header().Get("Access-Control-Allow-Credentials"); got != "" {
			t.Fatalf("expected empty allowlist to emit no credentials header, got %q", got)
		}
	})
}

func TestCORSPreflightOnlyReturnsHeadersForAllowedOrigins(t *testing.T) {
	t.Run("allowed origin preflight returns CORS headers", func(t *testing.T) {
		served := false
		handler := CORS([]string{"http://localhost:5173"})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			served = true
		}))

		req := httptest.NewRequest(http.MethodOptions, "/", nil)
		req.Header.Set("Origin", "http://localhost:5173")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if served {
			t.Fatal("expected preflight request to be short-circuited")
		}
		if rec.Code != http.StatusNoContent {
			t.Fatalf("expected status %d, got %d", http.StatusNoContent, rec.Code)
		}
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
			t.Fatalf("expected ACAO header for allowed preflight, got %q", got)
		}
		if got := rec.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
			t.Fatalf("expected credentials header for allowed preflight, got %q", got)
		}
		if got := rec.Header().Get("Access-Control-Allow-Methods"); got == "" {
			t.Fatal("expected allowed methods header for allowed preflight")
		}
		if got := rec.Header().Get("Access-Control-Allow-Headers"); got == "" {
			t.Fatal("expected allowed headers header for allowed preflight")
		}
	})

	t.Run("unknown origin preflight returns no CORS headers", func(t *testing.T) {
		served := false
		handler := CORS([]string{"http://localhost:5173"})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			served = true
		}))

		req := httptest.NewRequest(http.MethodOptions, "/", nil)
		req.Header.Set("Origin", "http://evil.example")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if served {
			t.Fatal("expected preflight request to be short-circuited")
		}
		if rec.Code != http.StatusNoContent {
			t.Fatalf("expected status %d, got %d", http.StatusNoContent, rec.Code)
		}
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "" {
			t.Fatalf("expected no ACAO header for unknown preflight, got %q", got)
		}
		if got := rec.Header().Get("Access-Control-Allow-Credentials"); got != "" {
			t.Fatalf("expected no credentials header for unknown preflight, got %q", got)
		}
	})
}
