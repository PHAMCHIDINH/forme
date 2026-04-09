package todo_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
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

func TestListViewTodayParsesAndForwardsOptionsOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Launch plan",
			Status:    todo.StatusInProgress,
			Priority:  todo.PriorityHigh,
			CreatedAt: time.Date(2026, 4, 1, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 4, 1, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/todos/?view=today&q=launch&tag=work&status=in_progress", nil)
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
	if len(store.listOpts) != 1 {
		t.Fatalf("expected list options to be captured once, got %#v", store.listOpts)
	}
	wantOpts := todo.ListOptions{View: "today", Search: "launch", Tag: "work", Status: todo.StatusInProgress}
	if got := store.listOpts[0]; got != wantOpts {
		t.Fatalf("expected parsed list options %#v, got %#v", wantOpts, got)
	}
	if len(resp.Data.Items) != 1 {
		t.Fatalf("expected one response item, got %d: %#v", len(resp.Data.Items), resp.Data.Items)
	}
	if resp.Data.Items[0].ID != "todo-1" || resp.Data.Items[0].Title != "Launch plan" || resp.Data.Items[0].Status != todo.StatusInProgress {
		t.Fatalf("unexpected response item: %#v", resp.Data.Items[0])
	}
}

func TestListViewOverdueParsesAndForwardsOptionsOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-2",
			Title:     "Past due",
			Status:    todo.StatusTodo,
			Priority:  todo.PriorityMedium,
			CreatedAt: time.Date(2026, 4, 1, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 4, 1, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/todos/?view=overdue&search=due", nil)
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
		t.Fatalf("expected overdue success, got error: %+v", *resp.Error)
	}
	if len(store.listOpts) != 1 {
		t.Fatalf("expected list options to be captured once, got %#v", store.listOpts)
	}
	wantOpts := todo.ListOptions{View: "overdue", Search: "due"}
	if got := store.listOpts[0]; got != wantOpts {
		t.Fatalf("expected parsed list options %#v, got %#v", wantOpts, got)
	}
	if len(resp.Data.Items) != 1 {
		t.Fatalf("expected one response item, got %d: %#v", len(resp.Data.Items), resp.Data.Items)
	}
	if resp.Data.Items[0].ID != "todo-2" || resp.Data.Items[0].Title != "Past due" {
		t.Fatalf("unexpected response item: %#v", resp.Data.Items[0])
	}
}

func TestCreateRichPayloadReturnsV2FieldsOverHTTP(t *testing.T) {
	store := newFakeTodoStore()
	router := newTodoTestRouter(store)
	dueAt := time.Date(2026, 4, 2, 15, 0, 0, 0, time.UTC)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/todos/", bytes.NewBufferString(`{
		"title":"Launch plan",
		"descriptionHtml":"<p>Finalize launch plan</p>",
		"status":"done",
		"priority":"high",
		"dueAt":"2026-04-02T15:00:00Z",
		"tags":["work","launch"]
	}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rec.Code)
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
		t.Fatalf("expected create success, got error: %+v", *resp.Error)
	}
	if resp.Data.Item.Title != "Launch plan" {
		t.Fatalf("expected title to survive create, got %#v", resp.Data.Item)
	}
	if resp.Data.Item.DescriptionHtml != "<p>Finalize launch plan</p>" {
		t.Fatalf("expected descriptionHtml to round-trip, got %#v", resp.Data.Item.DescriptionHtml)
	}
	if resp.Data.Item.Status != todo.StatusDone {
		t.Fatalf("expected status %q, got %#v", todo.StatusDone, resp.Data.Item.Status)
	}
	if resp.Data.Item.Priority != todo.PriorityHigh {
		t.Fatalf("expected priority %q, got %#v", todo.PriorityHigh, resp.Data.Item.Priority)
	}
	if resp.Data.Item.DueAt == nil || !resp.Data.Item.DueAt.Equal(dueAt) {
		t.Fatalf("expected dueAt %v, got %#v", dueAt, resp.Data.Item.DueAt)
	}
	if got, want := resp.Data.Item.Tags, []string{"work", "launch"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("expected tags %v, got %#v", want, got)
	}
	if resp.Data.Item.CompletedAt == nil {
		t.Fatal("expected completedAt to be server-managed on create")
	}
	if len(store.createParams) != 1 {
		t.Fatalf("expected create to reach the store once, got %#v", store.createParams)
	}
	if got := store.createParams[0].CompletedAt; got == nil {
		t.Fatalf("expected store create params to be server-managed, got %#v", got)
	}
}

func TestCreateRejectsUnknownJSONFieldsOverHTTP(t *testing.T) {
	cases := []struct {
		name string
		body string
	}{
		{
			name: "completedAt",
			body: `{"title":"Launch plan","completedAt":"2025-01-01T00:00:00Z"}`,
		},
		{
			name: "misspelled field",
			body: `{"title":"Launch plan","titel":"Launch plan"}`,
		},
	}

	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			store := newFakeTodoStore()
			router := newTodoTestRouter(store)

			req := httptest.NewRequest(http.MethodPost, "/api/v1/todos/", bytes.NewBufferString(tt.body))
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
				t.Fatal("expected error response for unknown field")
			}
			if resp.Error.Message != "invalid JSON payload" {
				t.Fatalf("expected invalid JSON payload error, got %q", resp.Error.Message)
			}
			if len(store.createParams) != 0 {
				t.Fatalf("expected create to be rejected before store call, got %#v", store.createParams)
			}
		})
	}
}

func TestCreateRejectsTrailingJSONBodyOverHTTP(t *testing.T) {
	store := newFakeTodoStore()
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/todos/", bytes.NewBufferString(`{"title":"Launch plan"}{"title":"Extra"}`))
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
		t.Fatal("expected error response for trailing JSON")
	}
	if resp.Error.Message != "invalid JSON payload" {
		t.Fatalf("expected invalid JSON payload error, got %q", resp.Error.Message)
	}
	if len(store.createParams) != 0 {
		t.Fatalf("expected create to be rejected before store call, got %#v", store.createParams)
	}
}

func TestPatchArchivesTaskOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Status:    todo.StatusTodo,
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)
	archivedAt := time.Date(2026, 4, 2, 18, 30, 0, 0, time.UTC)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-1", bytes.NewBufferString(`{
		"title":"Draft spec",
		"archivedAt":"2026-04-02T18:30:00Z"
	}`))
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
		t.Fatalf("expected archive success, got error: %+v", *resp.Error)
	}
	if resp.Data.Item.ArchivedAt == nil || !resp.Data.Item.ArchivedAt.Equal(archivedAt) {
		t.Fatalf("expected archivedAt to round-trip, got %#v", resp.Data.Item.ArchivedAt)
	}
	if got := store.items["todo-1"].ArchivedAt; got == nil || !got.Equal(archivedAt) {
		t.Fatalf("expected stored archivedAt to be set, got %#v", got)
	}
}

func TestPatchStatusDoneSetsCompletedAtOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Status:    todo.StatusTodo,
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-1", bytes.NewBufferString(`{
		"title":"Finish draft",
		"status":"done"
	}`))
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
	if resp.Data.Item.Status != todo.StatusDone {
		t.Fatalf("expected status to be done, got %#v", resp.Data.Item.Status)
	}
	if resp.Data.Item.CompletedAt == nil {
		t.Fatal("expected completedAt to be populated in the response")
	}
	if !resp.Data.Item.CompletedAt.After(time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected completedAt to be server-managed, got %#v", resp.Data.Item.CompletedAt)
	}
	if len(store.updateParams) != 1 {
		t.Fatalf("expected update to reach the store once, got %#v", store.updateParams)
	}
	if got := store.items["todo-1"].CompletedAt; got == nil {
		t.Fatalf("expected store record completedAt to be server-managed, got %#v", got)
	}
}

func TestPatchRejectsUnknownJSONFieldsOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Status:    todo.StatusTodo,
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-1", bytes.NewBufferString(`{
		"title":"Finish draft",
		"completedAt":"2025-01-02T00:00:00Z"
	}`))
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
		t.Fatal("expected error response for unknown field")
	}
	if resp.Error.Message != "invalid JSON payload" {
		t.Fatalf("expected invalid JSON payload error, got %q", resp.Error.Message)
	}
	if len(store.updateParams) != 0 {
		t.Fatalf("expected update to be rejected before store call, got %#v", store.updateParams)
	}
}

func TestPatchRejectsTrailingJSONBodyOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Status:    todo.StatusTodo,
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-1", bytes.NewBufferString(`{"title":"Finish draft"}{"title":"Extra"}`))
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
		t.Fatal("expected error response for trailing JSON")
	}
	if resp.Error.Message != "invalid JSON payload" {
		t.Fatalf("expected invalid JSON payload error, got %q", resp.Error.Message)
	}
	if len(store.updateParams) != 0 {
		t.Fatalf("expected update to be rejected before store call, got %#v", store.updateParams)
	}
}

func TestCreateReturnsInternalErrorOnStoreFailureOverHTTP(t *testing.T) {
	store := newFakeTodoStore()
	store.createErr = errors.New("db crashed")
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/todos/", bytes.NewBufferString(`{"title":"Launch plan"}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for store failure")
	}
	if resp.Error.Code != "internal_error" {
		t.Fatalf("expected internal_error code, got %#v", resp.Error.Code)
	}
	if resp.Error.Message != "failed to create todo" {
		t.Fatalf("expected stable create error message, got %q", resp.Error.Message)
	}
	if strings.Contains(resp.Error.Message, "db crashed") {
		t.Fatalf("expected backend error to stay hidden, got %q", resp.Error.Message)
	}
}

func TestPatchReturnsInternalErrorOnStoreFailureOverHTTP(t *testing.T) {
	store := newFakeTodoStore(
		todo.Item{
			ID:        "todo-1",
			Title:     "Draft spec",
			Status:    todo.StatusTodo,
			Completed: false,
			CreatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2026, 3, 31, 12, 0, 0, 0, time.UTC),
		},
	)
	store.updateErr = errors.New("db crashed")
	router := newTodoTestRouter(store)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/todos/todo-1", bytes.NewBufferString(`{"title":"Finish draft"}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected error response for store failure")
	}
	if resp.Error.Code != "internal_error" {
		t.Fatalf("expected internal_error code, got %#v", resp.Error.Code)
	}
	if resp.Error.Message != "failed to update todo" {
		t.Fatalf("expected stable update error message, got %q", resp.Error.Message)
	}
	if strings.Contains(resp.Error.Message, "db crashed") {
		t.Fatalf("expected backend error to stay hidden, got %q", resp.Error.Message)
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

	return httpserver.NewRouter(cfg, nil, authHandler, todoHandler, nil, authMiddleware)
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

	return httpserver.NewRouter(cfg, nil, authHandler, todoHandler, nil, authMiddleware)
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
	items        map[string]todo.Item
	order        []string
	listOpts     []todo.ListOptions
	createParams []todo.CreateParams
	updateParams []todo.UpdateParams
	createErr    error
	updateErr    error
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

func (s *fakeTodoStore) ListWithOptions(_ context.Context, _ string, opts todo.ListOptions) ([]todo.Item, error) {
	s.listOpts = append(s.listOpts, opts)
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
	if s.createErr != nil {
		return todo.Item{}, s.createErr
	}
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

func (s *fakeTodoStore) CreateV2(_ context.Context, _ string, params todo.CreateParams) (todo.Item, error) {
	s.createParams = append(s.createParams, params)
	if s.createErr != nil {
		return todo.Item{}, s.createErr
	}
	now := time.Now().UTC()
	item := todo.Item{
		ID:              fmt.Sprintf("todo-%d", len(s.items)+1),
		Title:           params.Title,
		DescriptionHtml: params.DescriptionHtml,
		Status:          params.Status,
		Priority:        params.Priority,
		DueAt:           params.DueAt,
		Tags:            append([]string(nil), params.Tags...),
		CompletedAt:     params.CompletedAt,
		ArchivedAt:      params.ArchivedAt,
		Completed:       params.Status == todo.StatusDone || params.CompletedAt != nil,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
	s.items[item.ID] = item
	s.order = append(s.order, item.ID)

	return item, nil
}

func (s *fakeTodoStore) Update(_ context.Context, _ string, todoID string, title *string, completed *bool) (todo.Item, error) {
	if s.updateErr != nil {
		return todo.Item{}, s.updateErr
	}
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

func (s *fakeTodoStore) UpdateV2(_ context.Context, _ string, todoID string, params todo.UpdateParams) (todo.Item, error) {
	s.updateParams = append(s.updateParams, params)
	if s.updateErr != nil {
		return todo.Item{}, s.updateErr
	}
	item, ok := s.items[todoID]
	if !ok {
		return todo.Item{}, todo.ErrNotFound
	}

	if params.Title.HasValue() {
		item.Title = params.Title.Value
	}
	if params.DescriptionHtml.HasValue() {
		item.DescriptionHtml = params.DescriptionHtml.Value
	}
	if params.Status.HasValue() {
		item.Status = params.Status.Value
	}
	if params.Priority.HasValue() {
		item.Priority = params.Priority.Value
	}
	if params.DueAt.HasValue() {
		value := params.DueAt.Value.UTC()
		item.DueAt = &value
	}
	if params.Tags.HasValue() {
		item.Tags = append([]string(nil), params.Tags.Value...)
	}
	if params.CompletedAt.HasValue() {
		value := params.CompletedAt.Value.UTC()
		item.CompletedAt = &value
	}
	if params.CompletedAt.IsNull() {
		item.CompletedAt = nil
	}
	if params.ArchivedAt.HasValue() {
		value := params.ArchivedAt.Value.UTC()
		item.ArchivedAt = &value
	}
	if params.ArchivedAt.IsNull() {
		item.ArchivedAt = nil
	}
	item.Completed = item.Status == todo.StatusDone || item.CompletedAt != nil
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
