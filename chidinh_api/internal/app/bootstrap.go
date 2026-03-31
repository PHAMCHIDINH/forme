package app

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	dbqueries "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/database"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/httpserver"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
)

func Run(cfg config.Config) error {
	addr := cfg.Port
	if !strings.HasPrefix(addr, ":") {
		addr = ":" + addr
	}

	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("database initialization failed: %w", err)
	}
	defer pool.Close()

	if err := database.EnsureSchema(ctx, pool); err != nil {
		return err
	}

	queries := dbqueries.New(pool)

	authService := auth.NewService(cfg, queries)
	authHandler := auth.NewHandler(cfg, authService)
	authMiddleware := middleware.NewAuth(authService)

	todoRepository := todo.NewRepository(queries)
	todoService := todo.NewService(todoRepository)
	todoHandler := todo.NewHandler(todoService)

	server := &http.Server{
		Addr:    addr,
		Handler: httpserver.NewRouter(cfg, authHandler, todoHandler, authMiddleware),
	}

	return server.ListenAndServe()
}
