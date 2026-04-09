package journal

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

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

	items, err := h.service.List(r.Context(), ownerID)
	if err != nil {
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to list journal entries")
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

	item, err := h.service.Create(r.Context(), ownerID, req.ToParams())
	if err != nil {
		writeJournalWriteError(w, err, "create")
		return
	}

	apiresponse.WriteJSON(w, http.StatusCreated, map[string]any{
		"item": item,
	})
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())
	entryID := chi.URLParam(r, "entryID")
	if entryID == "" {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "entryID is required")
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

	item, err := h.service.Update(r.Context(), ownerID, entryID, req.ToParams())
	if err != nil {
		writeJournalWriteError(w, err, "update")
		return
	}

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"item": item,
	})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())
	entryID := chi.URLParam(r, "entryID")
	if entryID == "" {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "entryID is required")
		return
	}

	if err := h.service.Delete(r.Context(), ownerID, entryID); err != nil {
		if errors.Is(err, ErrNotFound) {
			apiresponse.WriteError(w, http.StatusNotFound, "not_found", "journal entry not found")
			return
		}
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to delete journal entry")
		return
	}

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"success": true,
	})
}

func createValidationMessage(errs validation.Errors) string {
	if errs.Has("title", "notblank") {
		return "title is required"
	}
	if errs.Has("title", "max") {
		return "title must be at most 200 characters"
	}
	if errs.Has("type", "required") {
		return "type is required"
	}
	if errs.Has("type", "oneof") {
		return "type must be book or video"
	}
	if errs.Has("consumedOn", "required") {
		return "consumedOn is required"
	}
	if errs.Has("imageUrl", "url") {
		return "image URL is invalid"
	}
	if errs.Has("sourceUrl", "url") {
		return "source URL is invalid"
	}

	return "invalid request payload"
}

func updateValidationMessage(errs validation.Errors) string {
	if errs.Has("update", "required") {
		return "at least one field is required"
	}
	if errs.Has("title", "notblank") {
		return "title is required"
	}
	if errs.Has("title", "max") {
		return "title must be at most 200 characters"
	}
	if errs.Has("type", "required") {
		return "type is required"
	}
	if errs.Has("type", "oneof") {
		return "type must be book or video"
	}
	if errs.Has("consumedOn", "required") {
		return "consumedOn is required"
	}
	if errs.Has("imageUrl", "url") {
		return "image URL is invalid"
	}
	if errs.Has("sourceUrl", "url") {
		return "source URL is invalid"
	}

	return "invalid request payload"
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

func writeJournalWriteError(w http.ResponseWriter, err error, op string) {
	switch {
	case errors.Is(err, ErrNotFound):
		apiresponse.WriteError(w, http.StatusNotFound, "not_found", "journal entry not found")
	case isJournalValidationError(err):
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
	default:
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to "+op+" journal entry")
	}
}

func isJournalValidationError(err error) bool {
	return errors.Is(err, ErrInvalidType) ||
		errors.Is(err, ErrInvalidTitle) ||
		errors.Is(err, ErrTitleTooLong) ||
		errors.Is(err, ErrInvalidConsumedOn) ||
		errors.Is(err, ErrInvalidImageURL) ||
		errors.Is(err, ErrInvalidSourceURL) ||
		errors.Is(err, ErrInvalidUpdate)
}
