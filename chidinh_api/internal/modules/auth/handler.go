package auth

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
)

type Handler struct {
	cfg       config.Config
	service   *Service
	validator *validation.Validator
}

func NewHandler(cfg config.Config, service *Service, validator *validation.Validator) *Handler {
	return &Handler{
		cfg:       cfg,
		service:   service,
		validator: validator,
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
		return
	}

	if errs := h.validator.Validate(&req); len(errs) > 0 {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", loginValidationMessage(errs))
		return
	}

	session, err := h.service.Login(r.Context(), req.Username, req.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "invalid credentials")
			return
		}
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to authenticate")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    session.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: parseSameSite(h.cfg.CookieSameSite),
		Expires:  time.Now().Add(24 * time.Hour),
	})

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"user": session.User,
	})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(CookieName)
	if err != nil {
		apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "authentication required")
		return
	}

	claims, err := h.service.ParseToken(cookie.Value)
	if err != nil {
		apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "invalid authentication token")
		return
	}

	user, err := h.service.CurrentUser(r.Context(), claims.Subject)
	if err != nil {
		if errors.Is(err, ErrOwnerNotFound) {
			apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "invalid authentication token")
			return
		}
		apiresponse.WriteError(w, http.StatusInternalServerError, "internal_error", "failed to load authenticated user")
		return
	}

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"user": user,
	})
}

func (h *Handler) Logout(w http.ResponseWriter, _ *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: parseSameSite(h.cfg.CookieSameSite),
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"success": true,
	})
}

func parseSameSite(value string) http.SameSite {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "none":
		return http.SameSiteNoneMode
	case "strict":
		return http.SameSiteStrictMode
	default:
		return http.SameSiteLaxMode
	}
}

func loginValidationMessage(errs validation.Errors) string {
	if errs.Has("username", "required") || errs.Has("password", "required") {
		return "username and password are required"
	}

	return "invalid request payload"
}
