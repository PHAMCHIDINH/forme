package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

func main() {
	cfg := config.Load()
	if err := run(context.Background(), cfg.DatabaseURL, os.Args[1:]); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context, databaseURL string, args []string) error {
	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	command := "up"
	commandArgs := []string(nil)
	if len(args) > 0 {
		command = args[0]
		commandArgs = args[1:]
	}

	migrationsDir, err := findMigrationsDir()
	if err != nil {
		return err
	}

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to configure goose dialect: %w", err)
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	if err := db.PingContext(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	if err := goose.RunContext(ctx, command, db, migrationsDir, commandArgs...); err != nil {
		return fmt.Errorf("goose %s failed: %w", command, err)
	}

	return nil
}

func findMigrationsDir() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to resolve working directory: %w", err)
	}

	for dir := wd; ; dir = filepath.Dir(dir) {
		candidate := filepath.Join(dir, "db", "migrations")
		info, err := os.Stat(candidate)
		if err == nil && info.IsDir() {
			return candidate, nil
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
	}

	return "", fmt.Errorf("failed to find db/migrations from %s", wd)
}
