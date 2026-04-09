package httpserver

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
)

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
	router := NewRouter(config.Config{}, logger, nil, nil, nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/uploads/images/cover.txt", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
	if body := rec.Body.String(); body != "static upload" {
		t.Fatalf("expected static file contents, got %q", body)
	}
}
