package httpserver

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
)

func NewRouter(cfg config.Config, logger *slog.Logger, authHandler *auth.Handler, todoHandler *todo.Handler, authMiddleware *middleware.Auth) http.Handler {
	router := chi.NewRouter()
	router.Use(middleware.RequestLogger(logger))
	router.Use(middleware.CORS(cfg.CORSAllowedOrigins))

	router.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	router.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/login", authHandler.Login)
		r.Post("/logout", authHandler.Logout)
		r.With(authMiddleware.Require).Get("/me", authHandler.Me)
	})

	router.Route("/api/v1/todos", func(r chi.Router) {
		r.Use(authMiddleware.Require)
		r.Get("/", todoHandler.List)
		r.Post("/", todoHandler.Create)
		r.Patch("/{todoID}", todoHandler.Update)
		r.Delete("/{todoID}", todoHandler.Delete)
	})

	return router
}
