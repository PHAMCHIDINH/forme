package todo

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	ownerID := middleware.OwnerIDFromContext(r.Context())
	items, err := h.service.List(r.Context(), ownerID)
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
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
		return
	}

	item, err := h.service.Create(r.Context(), ownerID, req.Title)
	if err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
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
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
		return
	}
	if req.Title == nil && req.Completed == nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "at least one field is required")
		return
	}

	item, err := h.service.Update(r.Context(), ownerID, todoID, req.Title, req.Completed)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			apiresponse.WriteError(w, http.StatusNotFound, "not_found", "todo not found")
			return
		}
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
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
