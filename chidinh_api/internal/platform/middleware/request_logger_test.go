package middleware

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequestLoggerLogsMethodPathStatusAndDuration(t *testing.T) {
	var buf bytes.Buffer
	logger := slog.New(slog.NewJSONHandler(&buf, nil))

	handler := RequestLogger(logger)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusCreated)
	}))

	req := httptest.NewRequest(http.MethodPost, "/api/v1/todos", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	var entry map[string]any
	if err := json.Unmarshal(bytes.TrimSpace(buf.Bytes()), &entry); err != nil {
		t.Fatalf("expected JSON log entry, got error: %v", err)
	}

	if got := entry["method"]; got != http.MethodPost {
		t.Fatalf("expected method %q, got %#v", http.MethodPost, got)
	}
	if got := entry["path"]; got != "/api/v1/todos" {
		t.Fatalf("expected path %q, got %#v", "/api/v1/todos", got)
	}
	if got := entry["status"]; got != float64(http.StatusCreated) {
		t.Fatalf("expected status %d, got %#v", http.StatusCreated, got)
	}
	if _, ok := entry["duration"]; !ok {
		t.Fatal("expected duration field in request log")
	}
}
