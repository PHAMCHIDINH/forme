package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/app"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	applogger "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/logger"
)

func main() {
	if err := config.LoadLocalEnv(); err != nil {
		fmt.Fprintf(os.Stderr, "failed to load local env: %v\n", err)
		os.Exit(1)
	}

	cfg := config.Load()
	logger := applogger.New(cfg.AppEnv)
	slog.SetDefault(logger)

	if err := cfg.Validate(); err != nil {
		logger.Error("configuration validation failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
	if err := app.Run(cfg, logger); err != nil {
		logger.Error("api exited", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
