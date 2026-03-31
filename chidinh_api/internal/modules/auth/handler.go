package auth

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
)

type Handler struct {
	cfg     config.Config
	service *Service
}

func NewHandler(cfg config.Config, service *Service) *Handler {
	return &Handler{
		cfg:     cfg,
		service: service,
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "invalid JSON payload")
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Password = strings.TrimSpace(req.Password)
	if req.Username == "" || req.Password == "" {
		apiresponse.WriteError(w, http.StatusBadRequest, "bad_request", "username and password are required")
		return
	}

	token, err := h.service.Login(req.Username, req.Password)
	if err != nil {
		apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "invalid credentials")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: parseSameSite(h.cfg.CookieSameSite),
		Expires:  time.Now().Add(24 * time.Hour),
	})

	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"user": h.service.CurrentUser(),
	})
}

func (h *Handler) Me(w http.ResponseWriter, _ *http.Request) {
	apiresponse.WriteJSON(w, http.StatusOK, map[string]any{
		"user": h.service.CurrentUser(),
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
