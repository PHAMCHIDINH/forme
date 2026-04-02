package todo

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"

	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
)

type Handler struct {
	service   *Service
	validator *validation.Validator
}

func NewHandler(service *Service, validator *validation.Validator) *Handler {
	return &Handler{
		service:   service,
		validator: validator,
	}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())
	opts, err := parseListOptions(r.URL.Query())
	if err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	items, err := h.service.ListV2(r.Context(), ownerID, opts)
	if err != nil {
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to list todos")
		return
	}

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"items": items,
	})
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())

	var req CreateRequest
	if err := decodeStrictJSON(r.Body, &req); err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
		return
	}
	if errs := h.validator.Validate(&req); len(errs) > 0 {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", createValidationMessage(errs))
		return
	}

	item, err := h.service.CreateV2(r.Context(), ownerID, req.ToParams())
	if err != nil {
		writeTodoWriteError(w, err, "create")
		return
	}

	apiresponse.WriteJSON(w, http.StatusCreated, map[string]any{
		"item": item,
	})
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())
	todoID := chi.URLParam(r, "todoID")
	if todoID == "" {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "todoID is required")
		return
	}

	var req UpdateRequest
	if err := decodeStrictJSON(r.Body, &req); err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
		return
	}
	if errs := h.validator.Validate(&req); len(errs) > 0 {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", updateValidationMessage(errs))
		return
	}

	item, err := h.service.UpdateV2(r.Context(), ownerID, todoID, req.ToParams())
	if err != nil {
		writeTodoWriteError(w, err, "update")
		return
	}

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"item": item,
	})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())
	todoID := chi.URLParam(r, "todoID")
	if todoID == "" {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "todoID is required")
		return
	}

	if err := h.service.Delete(r.Context(), ownerID, todoID); err != nil {
		if errors.Is(err, ErrNotFound) {
			apiresponse.WriteError(w, http.StatusNotFound, "not_found", "todo not found")
			return
		}
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to delete todo")
		return
	}

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"success": true,
	})
}

func createValidationMessage(errs validation.Errors) string {
	if errs.Has("title", "required") {
		return "title is required"
	}
	if errs.Has("title", "notblank") {
		return "title is required"
	}
	if errs.Has("title", "max") {
		return "title must be at most 200 characters"
	}
	if errs.Has("status", "oneof") {
		return "invalid status"
	}
	if errs.Has("priority", "oneof") {
		return "invalid priority"
	}

	return "invalid request payload"
}

func updateValidationMessage(errs validation.Errors) string {
	if errs.Has("update", "required") {
		return "at least one field is required"
	}
	if errs.Has("title", "notblank") {
		return "title cannot be empty"
	}
	if errs.Has("title", "max") {
		return "title must be at most 200 characters"
	}
	if errs.Has("status", "oneof") {
		return "invalid status"
	}
	if errs.Has("priority", "oneof") {
		return "invalid priority"
	}

	return "invalid request payload"
}

func parseListOptions(values url.Values) (ListOptions, error) {
	view := strings.ToLower(strings.TrimSpace(values.Get("view")))
	search := strings.TrimSpace(firstNonEmpty(values.Get("q"), values.Get("search")))
	tag := strings.ToLower(strings.TrimSpace(values.Get("tag")))
	status := strings.TrimSpace(values.Get("status"))

	switch view {
	case "", "active", "today", "upcoming", "overdue", "completed", "archived":
	default:
		return ListOptions{}, ErrInvalidView
	}

	var parsedStatus Status
	if status != "" {
		switch Status(status) {
		case StatusTodo, StatusInProgress, StatusDone, StatusCancelled:
			parsedStatus = Status(status)
		default:
			return ListOptions{}, ErrInvalidStatus
		}
	}

	return ListOptions{
		View:   view,
		Search: search,
		Tag:    tag,
		Status: parsedStatus,
	}, nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			return trimmed
		}
	}

	return ""
}

func decodeStrictJSON(body io.Reader, dst any) error {
	decoder := json.NewDecoder(body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		return err
	}

	var extra json.RawMessage
	if err := decoder.Decode(&extra); err != io.EOF {
		if err == nil {
			return errors.New("unexpected trailing JSON data")
		}
		return err
	}

	return nil
}

func writeTodoWriteError(w http.ResponseWriter, err error, op string) {
	switch {
	case errors.Is(err, ErrNotFound):
		apiresponse.WriteError(w, http.StatusNotFound, "not_found", "todo not found")
	case isTodoValidationError(err):
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
	default:
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to "+op+" todo")
	}
}

func isTodoValidationError(err error) bool {
	return errors.Is(err, ErrInvalidTitle) ||
		errors.Is(err, ErrTitleTooLong) ||
		errors.Is(err, ErrInvalidStatus) ||
		errors.Is(err, ErrInvalidPriority)
}
