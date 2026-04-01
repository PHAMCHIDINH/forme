package config

import (
	"strings"
	"testing"
)

func TestLoadUsesRepoFriendlyDefaults(t *testing.T) {
	t.Setenv("PORT", "")
	t.Setenv("APP_ENV", "")
	t.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/pdh?sslmode=disable")
	t.Setenv("JWT_SECRET", "secret")
	t.Setenv("OWNER_USERNAME", "owner")
	t.Setenv("OWNER_PASSWORD_HASH", "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC")
	t.Setenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173, http://localhost:4173")
	t.Setenv("COOKIE_SECURE", "")
	t.Setenv("COOKIE_SAME_SITE", "")

	cfg := Load()

	if cfg.Port != "8080" {
		t.Fatalf("expected default port %q, got %q", "8080", cfg.Port)
	}
	if cfg.AppEnv != "development" {
		t.Fatalf("expected default app env %q, got %q", "development", cfg.AppEnv)
	}
	if cfg.DatabaseURL == "" {
		t.Fatal("expected database url to be loaded")
	}
	if cfg.JWTSecret != "secret" {
		t.Fatalf("expected JWT secret to be loaded, got %q", cfg.JWTSecret)
	}
	if cfg.OwnerUsername != "owner" {
		t.Fatalf("expected owner username to be loaded, got %q", cfg.OwnerUsername)
	}
	if cfg.OwnerPasswordHash == "" {
		t.Fatal("expected owner password hash to be loaded")
	}
	if len(cfg.CORSAllowedOrigins) != 2 {
		t.Fatalf("expected 2 CORS origins, got %d", len(cfg.CORSAllowedOrigins))
	}
	if cfg.CookieSecure {
		t.Fatal("expected cookie secure to default to false")
	}
	if cfg.CookieSameSite != "Lax" {
		t.Fatalf("expected default same-site %q, got %q", "Lax", cfg.CookieSameSite)
	}
}

func TestValidateRejectsMissingCriticalRuntimeSettings(t *testing.T) {
	testCases := []struct {
		name    string
		config  Config
		wantErr string
	}{
		{
			name: "missing database url",
			config: Config{
				JWTSecret:         "secret",
				OwnerUsername:     "owner",
				OwnerPasswordHash: "hash",
			},
			wantErr: "DATABASE_URL is required",
		},
		{
			name: "missing jwt secret",
			config: Config{
				DatabaseURL:       "postgres://example",
				OwnerUsername:     "owner",
				OwnerPasswordHash: "hash",
			},
			wantErr: "JWT_SECRET is required",
		},
		{
			name: "missing owner username",
			config: Config{
				DatabaseURL:       "postgres://example",
				JWTSecret:         "secret",
				OwnerPasswordHash: "hash",
			},
			wantErr: "OWNER_USERNAME is required",
		},
		{
			name: "missing owner password hash",
			config: Config{
				DatabaseURL:   "postgres://example",
				JWTSecret:     "secret",
				OwnerUsername: "owner",
			},
			wantErr: "OWNER_PASSWORD_HASH is required",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.config.Validate()
			if err == nil {
				t.Fatal("expected validation error")
			}
			if got := err.Error(); got != tc.wantErr {
				t.Fatalf("expected error %q, got %q", tc.wantErr, got)
			}
		})
	}
}

func TestValidateAcceptsLoadedConfig(t *testing.T) {
	cfg := Config{
		DatabaseURL:       "postgres://postgres:postgres@localhost:5432/pdh?sslmode=disable",
		JWTSecret:         "secret",
		OwnerUsername:     "owner",
		OwnerPasswordHash: "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC",
	}

	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected config to validate, got error: %v", err)
	}
}

func TestLoadTrimsCORSOrigins(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", " http://localhost:5173 , , http://localhost:4173 ")

	cfg := Load()

	if got := strings.Join(cfg.CORSAllowedOrigins, ","); got != "http://localhost:5173,http://localhost:4173" {
		t.Fatalf("expected trimmed origins, got %q", got)
	}
}
