package journal_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/journal"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/httpserver"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
	"github.com/jackc/pgx/v5"
)

const owner123Hash = "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC"

func TestListReturnsEntriesOverHTTP(t *testing.T) {
	store := newFakeJournalStore(
		journal.Entry{
			ID:         "journal-1",
			Type:       journal.EntryTypeBook,
			Title:      "Older book",
			ConsumedOn: journal.DateOnlyFromTime(time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)),
			CreatedAt:  time.Date(2026, 4, 1, 8, 0, 0, 0, time.UTC),
			UpdatedAt:  time.Date(2026, 4, 1, 8, 0, 0, 0, time.UTC),
		},
		journal.Entry{
			ID:         "journal-2",
			Type:       journal.EntryTypeVideo,
			Title:      "Newer video",
			ConsumedOn: journal.DateOnlyFromTime(time.Date(2026, 4, 3, 0, 0, 0, 0, time.UTC)),
			CreatedAt:  time.Date(2026, 4, 3, 9, 0, 0, 0, time.UTC),
			UpdatedAt:  time.Date(2026, 4, 3, 9, 0, 0, 0, time.UTC),
		},
	)
	router := newJournalTestRouter(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/journal/", nil)
	req.AddCookie(authCookie(t))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var resp struct {
		Data struct {
			Items []journal.Entry `json:"items"`
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
		t.Fatalf("expected 2 entries, got %d", len(resp.Data.Items))
	}
	gotIDs := map[string]bool{}
	for _, item := range resp.Data.Items {
		gotIDs[item.ID] = true
	}
	if !gotIDs["journal-1"] || !gotIDs["journal-2"] {
		t.Fatalf("expected both journal entries in response, got %#v", resp.Data.Items)
	}
}

func TestCreateReturnsCreatedEntryOverHTTP(t *testing.T) {
	store := newFakeJournalStore()
	router := newJournalTestRouter(store)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/journal/", bytes.NewBufferString(`{
		"type":"book",
		"title":"  Launch notes  ",
		"imageUrl":"https://example.com/cover.jpg",
		"sourceUrl":"https://example.com/book",
		"consumedOn":"2026-04-02"
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
			Item journal.Entry `json:"item"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON response, got error: %v", err)
	}
	if resp.Error != nil {
		t.Fatalf("expected create success, got error: %+v", *resp.Error)
	}
	if resp.Data.Item.Title != "Launch notes" {
		t.Fatalf("expected trimmed title, got %#v", resp.Data.Item.Title)
	}
	if resp.Data.Item.Type != journal.EntryTypeBook {
		t.Fatalf("expected type to round-trip, got %#v", resp.Data.Item.Type)
	}
	if resp.Data.Item.ImageURL == nil || *resp.Data.Item.ImageURL != "https://example.com/cover.jpg" {
		t.Fatalf("expected image URL to round-trip, got %#v", resp.Data.Item.ImageURL)
	}
	if resp.Data.Item.SourceURL == nil || *resp.Data.Item.SourceURL != "https://example.com/book" {
		t.Fatalf("expected source URL to round-trip, got %#v", resp.Data.Item.SourceURL)
	}
	if !resp.Data.Item.ConsumedOn.Equal(time.Date(2026, 4, 2, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected consumedOn to round-trip, got %#v", resp.Data.Item.ConsumedOn)
	}
	if len(store.createParams) != 1 {
		t.Fatalf("expected create to reach the store once, got %#v", store.createParams)
	}
	if got := store.createParams[0]; got.Title != "Launch notes" || got.Type != journal.EntryTypeBook {
		t.Fatalf("expected normalized create params, got %#v", got)
	}
}

func TestCreateRejectsBlankTitleOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodPost, "/api/v1/journal/", bytes.NewBufferString(`{"type":"book","title":"   ","consumedOn":"2026-04-02"}`))
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
		t.Fatalf("expected title validation message, got %q", resp.Error.Message)
	}
}

func TestCreateRejectsMissingConsumedOnOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodPost, "/api/v1/journal/", bytes.NewBufferString(`{"type":"book","title":"Launch notes"}`))
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
		t.Fatal("expected error response for missing consumedOn")
	}
	if resp.Error.Message != "consumedOn is required" {
		t.Fatalf("expected consumedOn validation message, got %q", resp.Error.Message)
	}
}

func TestCreateRejectsUnknownJSONFieldsOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodPost, "/api/v1/journal/", bytes.NewBufferString(`{"type":"book","title":"Launch notes","consumedOn":"2026-04-02","titel":"oops"}`))
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
}

func TestUpdateRejectsEmptyPayloadOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/journal/journal-1", bytes.NewBufferString(`{}`))
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
		t.Fatalf("expected empty patch validation message, got %q", resp.Error.Message)
	}
}

func TestUpdateRejectsNullTitleOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/journal/journal-1", bytes.NewBufferString(`{"title":null}`))
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
		t.Fatal("expected error response for null title patch")
	}
	if resp.Error.Message != "title is required" {
		t.Fatalf("expected title validation message, got %q", resp.Error.Message)
	}
}

func TestUpdateReturnsUpdatedEntryOverHTTP(t *testing.T) {
	store := newFakeJournalStore(
		journal.Entry{
			ID:         "journal-1",
			Type:       journal.EntryTypeBook,
			Title:      "Original title",
			ImageURL:   stringPtr("https://example.com/original.jpg"),
			SourceURL:  stringPtr("https://example.com/original"),
			Review:     stringPtr("Original review"),
			ConsumedOn: journal.DateOnlyFromTime(time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)),
			CreatedAt:  time.Date(2026, 4, 1, 8, 0, 0, 0, time.UTC),
			UpdatedAt:  time.Date(2026, 4, 1, 8, 0, 0, 0, time.UTC),
		},
	)
	router := newJournalTestRouter(store)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/journal/journal-1", bytes.NewBufferString(`{
		"title":"  Updated title  ",
		"imageUrl":"/uploads/images/cover.png",
		"review":"  Updated review  ",
		"consumedOn":"2026-04-04"
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
			Item journal.Entry `json:"item"`
		} `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON response, got error: %v", err)
	}
	if resp.Error != nil {
		t.Fatalf("expected update success, got error: %+v", *resp.Error)
	}
	if resp.Data.Item.Title != "Updated title" {
		t.Fatalf("expected trimmed title, got %#v", resp.Data.Item.Title)
	}
	if resp.Data.Item.ImageURL == nil || *resp.Data.Item.ImageURL != "/uploads/images/cover.png" {
		t.Fatalf("expected relative image URL to round-trip, got %#v", resp.Data.Item.ImageURL)
	}
	if resp.Data.Item.Review == nil || *resp.Data.Item.Review != "  Updated review  " {
		t.Fatalf("expected review to round-trip unchanged, got %#v", resp.Data.Item.Review)
	}
	if !resp.Data.Item.ConsumedOn.Equal(time.Date(2026, 4, 4, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected consumedOn to update, got %#v", resp.Data.Item.ConsumedOn)
	}
	if len(store.updateParams) != 1 {
		t.Fatalf("expected update to reach the store once, got %#v", store.updateParams)
	}
	if got := store.updateParams[0]; !got.Title.HasValue() || got.Title.Value != "Updated title" {
		t.Fatalf("expected normalized title patch, got %#v", got.Title)
	}
}

func TestUpdateReturnsNotFoundOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/journal/journal-404", bytes.NewBufferString(`{"title":"Updated"}`))
	req.AddCookie(authCookie(t))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected not-found error response")
	}
	if resp.Error.Message != "journal entry not found" {
		t.Fatalf("expected not-found message, got %q", resp.Error.Message)
	}
}

func TestDeleteRemovesEntryOverHTTP(t *testing.T) {
	store := newFakeJournalStore(
		journal.Entry{
			ID:         "journal-1",
			Type:       journal.EntryTypeBook,
			Title:      "Delete me",
			ConsumedOn: journal.DateOnlyFromTime(time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)),
			CreatedAt:  time.Date(2026, 4, 1, 8, 0, 0, 0, time.UTC),
			UpdatedAt:  time.Date(2026, 4, 1, 8, 0, 0, 0, time.UTC),
		},
	)
	router := newJournalTestRouter(store)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/journal/journal-1", nil)
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
	if _, ok := store.items["journal-1"]; ok {
		t.Fatal("expected journal entry to be removed from store")
	}
}

func TestDeleteReturnsNotFoundOverHTTP(t *testing.T) {
	router := newJournalTestRouter(newFakeJournalStore())

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/journal/journal-404", nil)
	req.AddCookie(authCookie(t))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, rec.Code)
	}

	var resp struct {
		Data  any                   `json:"data"`
		Error *apiresponse.APIError `json:"error"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("expected JSON error response, got error: %v", err)
	}
	if resp.Error == nil {
		t.Fatal("expected not-found error response")
	}
	if resp.Error.Message != "journal entry not found" {
		t.Fatalf("expected not-found message, got %q", resp.Error.Message)
	}
}

func newJournalTestRouter(store journal.JournalStore) http.Handler {
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
	var todoHandler *todo.Handler
	journalHandler := journal.NewHandler(journal.NewService(store), validation.New())

	return httpserver.NewRouter(cfg, nil, authHandler, todoHandler, journalHandler, authMiddleware)
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

type fakeJournalStore struct {
	items        map[string]journal.Entry
	order        []string
	createParams []journal.CreateParams
	updateParams []journal.UpdateParams
	deleteCalls  []string
	listErr      error
	createErr    error
	updateErr    error
	deleteErr    error
}

func newFakeJournalStore(items ...journal.Entry) *fakeJournalStore {
	store := &fakeJournalStore{
		items: make(map[string]journal.Entry, len(items)),
		order: make([]string, 0, len(items)),
	}
	for _, item := range items {
		store.items[item.ID] = item
		store.order = append(store.order, item.ID)
	}

	return store
}

func (s *fakeJournalStore) List(_ context.Context, _ string) ([]journal.Entry, error) {
	if s.listErr != nil {
		return nil, s.listErr
	}

	items := make([]journal.Entry, 0, len(s.order))
	for _, id := range s.order {
		item, ok := s.items[id]
		if !ok {
			continue
		}
		items = append(items, item)
	}

	return items, nil
}

func (s *fakeJournalStore) Create(_ context.Context, _ string, params journal.CreateParams) (journal.Entry, error) {
	s.createParams = append(s.createParams, params)
	if s.createErr != nil {
		return journal.Entry{}, s.createErr
	}

	item := journal.Entry{
		ID:         fmt.Sprintf("journal-%d", len(s.createParams)),
		Type:       params.Type,
		Title:      params.Title,
		ImageURL:   cloneStringPtr(params.ImageURL),
		SourceURL:  cloneStringPtr(params.SourceURL),
		Review:     cloneStringPtr(params.Review),
		ConsumedOn: params.ConsumedOn,
		CreatedAt:  time.Date(2026, 4, 2, 12, 0, 0, 0, time.UTC),
		UpdatedAt:  time.Date(2026, 4, 2, 12, 0, 0, 0, time.UTC),
	}
	s.items[item.ID] = item
	s.order = append(s.order, item.ID)

	return item, nil
}

func (s *fakeJournalStore) Update(_ context.Context, _ string, entryID string, params journal.UpdateParams) (journal.Entry, error) {
	s.updateParams = append(s.updateParams, params)
	if s.updateErr != nil {
		return journal.Entry{}, s.updateErr
	}

	item, ok := s.items[entryID]
	if !ok {
		return journal.Entry{}, journal.ErrNotFound
	}
	if params.Type.HasValue() {
		item.Type = params.Type.Value
	}
	if params.Title.HasValue() {
		item.Title = params.Title.Value
	}
	if params.ImageURL.Present {
		if params.ImageURL.Null {
			item.ImageURL = nil
		} else {
			item.ImageURL = cloneStringPtr(&params.ImageURL.Value)
		}
	}
	if params.SourceURL.Present {
		if params.SourceURL.Null {
			item.SourceURL = nil
		} else {
			item.SourceURL = cloneStringPtr(&params.SourceURL.Value)
		}
	}
	if params.Review.Present {
		if params.Review.Null {
			item.Review = nil
		} else {
			item.Review = cloneStringPtr(&params.Review.Value)
		}
	}
	if params.ConsumedOn.HasValue() {
		item.ConsumedOn = params.ConsumedOn.Value
	}
	item.UpdatedAt = time.Date(2026, 4, 2, 13, 0, 0, 0, time.UTC)
	s.items[entryID] = item

	return item, nil
}

func (s *fakeJournalStore) Delete(_ context.Context, _ string, entryID string) error {
	s.deleteCalls = append(s.deleteCalls, entryID)
	if s.deleteErr != nil {
		return s.deleteErr
	}

	if _, ok := s.items[entryID]; !ok {
		return journal.ErrNotFound
	}
	delete(s.items, entryID)

	return nil
}

func cloneStringPtr(value *string) *string {
	if value == nil {
		return nil
	}

	clone := *value
	return &clone
}
