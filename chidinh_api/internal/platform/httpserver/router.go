package httpserver

import (
	"log/slog"
	"net/http"
	"path/filepath"

	"github.com/go-chi/chi/v5"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/journal"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
)

func NewRouter(cfg config.Config, logger *slog.Logger, authHandler *auth.Handler, todoHandler *todo.Handler, journalHandler *journal.Handler, authMiddleware *middleware.Auth) http.Handler {
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

	router.Route("/api/v1/journal", func(r chi.Router) {
		r.Use(authMiddleware.Require)
		r.Get("/", journalHandler.List)
		r.Post("/", journalHandler.Create)
		r.Patch("/{entryID}", journalHandler.Update)
		r.Delete("/{entryID}", journalHandler.Delete)
	})

	router.Route("/api/v1/uploads", func(r chi.Router) {
		r.Use(authMiddleware.Require)
		r.Post("/images", journalHandler.UploadImage)
	})

	router.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(filepath.Dir(journal.UploadImagesDir)))))

	return router
}
