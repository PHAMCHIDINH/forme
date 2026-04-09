package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	dbqueries "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/journal"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/database"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/httpserver"
	applogger "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/logger"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/middleware"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
)

func Run(cfg config.Config, logger *slog.Logger) error {
	addr := cfg.Port
	if !strings.HasPrefix(addr, ":") {
		addr = ":" + addr
	}
	if logger == nil {
		logger = applogger.New(cfg.AppEnv)
	}

	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("database initialization failed: %w", err)
	}
	defer pool.Close()

	if err := database.SeedLocalOwner(ctx, database.NewOwnerSeedStore(pool), cfg); err != nil {
		return err
	}

	queries := dbqueries.New(pool)
	requestValidator := validation.New()

	authService := auth.NewService(cfg, queries)
	authHandler := auth.NewHandler(cfg, authService, requestValidator)
	authMiddleware := middleware.NewAuth(authService)

	todoRepository := todo.NewRepository(queries)
	todoService := todo.NewService(todoRepository)
	todoHandler := todo.NewHandler(todoService, requestValidator)

	journalRepository := journal.NewRepository(queries)
	journalService := journal.NewService(journalRepository)
	journalHandler := journal.NewHandler(journalService, requestValidator)

	server := &http.Server{
		Addr:    addr,
		Handler: httpserver.NewRouter(cfg, logger, authHandler, todoHandler, journalHandler, authMiddleware),
	}

	logger.Info("starting api server", slog.String("addr", addr))

	err = server.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("api server stopped", slog.String("error", err.Error()))
		return err
	}

	return nil
}
