package todo_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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

func TestListReturnsExpectedRecordsOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
		todo.Item{
			ID:        "todo-2",
			Title:     "Review notes",
			Completed: true,
			CreatedAt: time.Date(2026, 3, 31, 13, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 14, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/todos/", nil)
	req.AddCookie(authCookie(t))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var resp struct {
		Data struct {
			Items []todo.Item `json:"items"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON response, got error: %v", err)
	}
	if resp.Error != nil {
		t.Fatalf("expected list success, got error: %+v", *resp.Error)
	}
	if len(resp.Data.Items) != 2 {
		t.Fatalf("expected 2 todos, got %d", len(resp.Data.Items))
	}
	if resp.Data.Items[0].ID != "todo-1" || resp.Data.Items[0].Title != "Draft spec" || resp.Data.Items[0].Completed {
		t.Fatalf("unexpected first todo: %+v", resp.Data.Items[0])
	}
	if resp.Data.Items[1].ID != "todo-2" || resp.Data.Items[1].Title != "Review notes" || !resp.Data.Items[1].Completed {
		t.Fatalf("unexpected second todo: %+v", resp.Data.Items[1])
	}
}

func TestTodoCompletionUpdateUpdatesRecordOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-1", bytes.NewBufferString(`{"completed":true}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var resp struct {
		Data struct {
			Item todo.Item `json:"item"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON response, got error: %v", err)
	}
	if resp.Error != nil {
		t.Fatalf("expected update success, got error: %+v", *resp.Error)
	}
	if resp.Data.Item.ID != "todo-1" {
		t.Fatalf("expected todo id %q, got %q", "todo-1", resp.Data.Item.ID)
	}
	if !resp.Data.Item.Completed {
		t.Fatalf("expected todo to be completed, got %+v", resp.Data.Item)
	}
	if got := store.items["todo-1"]; !got.Completed {
		t.Fatalf("expected stored todo to be completed, got %+v", got)
	}
}

func TestTodoDeleteRemovesRecordOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/todos/todo-1", nil)
	req.AddCookie(authCookie(t))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var resp struct {
		Data struct {
			Success bool `json:"success"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON response, got error: %v", err)
	}
	if resp.Error != nil {
		t.Fatalf("expected delete success, got error: %+v", *resp.Error)
	}
	if !resp.Data.Success {
		t.Fatal("expected delete success flag to be true")
	}
	if _, ok := store.items["todo-1"]; ok {
		t.Fatal("expected todo to be removed from store")
	}
}

func TestTodoDeleteRemovesRecordFromListOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
		todo.Item{
			ID:        "todo-2",
			Title:     "Review notes",
			Completed: true,
			CreatedAt: time.Date(2026, 3, 31, 13, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 14, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/todos/todo-1", nil)
	req.AddCookie(authCookie(t))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/todos/", nil)
	listReq.AddCookie(authCookie(t))
	listRec := httptest.NewRecorder()

	router.ServeHTTP(listRec, listReq)

	if listRec.Code != http.StatusOK {
		t.Fatalf("expected list status %d, got %d", http.StatusOK, listRec.Code)
	}

	var listResp struct {
		Data struct {
			Items []todo.Item `json:"items"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(listRec.Body).Decode(&listResp); err != nil {
		t.Fatalf("expected JSON response, got error: %v", err)
	}
	if listResp.Error != nil {
		t.Fatalf("expected list success, got error: %+v", *listResp.Error)
	}
	if len(listResp.Data.Items) != 1 {
		t.Fatalf("expected 1 todo after delete, got %d", len(listResp.Data.Items))
	}
	if listResp.Data.Items[0].ID != "todo-2" {
		t.Fatalf("expected remaining todo %q, got %+v", "todo-2", listResp.Data.Items[0])
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

func newTodoTestRouter(store todo.TodoStore) http.Handler {
	cfg := config.Config{JWTSecret: "test-secret"}
	owner := db.Owner{
		ID:           "owner-123",
		Username:     "owner",
		PasswordHash: owner123Hash,
		DisplayName:  "Owner Name",
	}
	ownerStore := stubOwnerStore{
		ownersByUsername: map[string]db.Owner{
			owner.Username: owner,
		},
		ownersByID: map[string]db.Owner{
			owner.ID: owner,
		},
	}

	authService := auth.NewService(cfg, ownerStore)
	authMiddleware := middleware.NewAuth(authService)
	authHandler := auth.NewHandler(cfg, authService, validation.New())
	todoHandler := todo.NewHandler(todo.NewService(store), validation.New())

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

type fakeTodoStore struct {
	items map[string]todo.Item
	order []string
}

func newFakeTodoStore(items ...todo.Item) *fakeTodoStore {
	store := &fakeTodoStore{
		items: make(map[string]todo.Item, len(items)),
		order: make([]string, 0, len(items)),
	}

	for _, item := range items {
		store.items[item.ID] = item
		store.order = append(store.order, item.ID)
	}

	return store
}

func (s *fakeTodoStore) List(_ context.Context, _ string) ([]todo.Item, error) {
	items := make([]todo.Item, 0, len(s.order))
	for _, id := range s.order {
		item, ok := s.items[id]
		if !ok {
			continue
		}
		items = append(items, item)
	}

	return items, nil
}

func (s *fakeTodoStore) Create(_ context.Context, _ string, title string) (todo.Item, error) {
	now := time.Now().UTC()
	item := todo.Item{
		ID:        fmt.Sprintf("todo-%d", len(s.items)+1),
		Title:     title,
		Completed: false,
		CreatedAt: now,
		UpdatedAt: now,
	}
	s.items[item.ID] = item
	s.order = append(s.order, item.ID)

	return item, nil
}

func (s *fakeTodoStore) Update(_ context.Context, _ string, todoID string, title *string, completed *bool) (todo.Item, error) {
	item, ok := s.items[todoID]
	if !ok {
		return todo.Item{}, todo.ErrNotFound
	}

	if title != nil {
		item.Title = *title
	}
	if completed != nil {
		item.Completed = *completed
	}
	item.UpdatedAt = time.Now().UTC()
	s.items[todoID] = item

	return item, nil
}

func (s *fakeTodoStore) Delete(_ context.Context, _ string, todoID string) error {
	if _, ok := s.items[todoID]; !ok {
		return todo.ErrNotFound
	}

	delete(s.items, todoID)
	nextOrder := s.order[:0]
	for _, id := range s.order {
		if id != todoID {
			nextOrder = append(nextOrder, id)
		}
	}
	s.order = nextOrder

	return nil
}
