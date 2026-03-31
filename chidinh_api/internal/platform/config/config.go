package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port               string
	AppEnv             string
	DatabaseURL        string
	JWTSecret          string
	OwnerUsername      string
	OwnerPasswordHash  string
	CORSAllowedOrigins []string
	CookieSecure       bool
	CookieSameSite     string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "development"
	}

	cookieSameSite := os.Getenv("COOKIE_SAME_SITE")
	if cookieSameSite == "" {
		cookieSameSite = "Lax"
	}

	return Config{
		Port:               port,
		AppEnv:             appEnv,
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		OwnerUsername:      os.Getenv("OWNER_USERNAME"),
		OwnerPasswordHash:  os.Getenv("OWNER_PASSWORD_HASH"),
		CORSAllowedOrigins: parseCSVEnv("CORS_ALLOWED_ORIGINS"),
		CookieSecure:       parseBool(os.Getenv("COOKIE_SECURE")),
		CookieSameSite:     cookieSameSite,
	}
}

func (c Config) Validate() error {
	switch {
	case strings.TrimSpace(c.DatabaseURL) == "":
		return fmt.Errorf("DATABASE_URL is required")
	case strings.TrimSpace(c.JWTSecret) == "":
		return fmt.Errorf("JWT_SECRET is required")
	case strings.TrimSpace(c.OwnerUsername) == "":
		return fmt.Errorf("OWNER_USERNAME is required")
	case strings.TrimSpace(c.OwnerPasswordHash) == "":
		return fmt.Errorf("OWNER_PASSWORD_HASH is required")
	default:
		return nil
	}
}

func parseCSVEnv(key string) []string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return nil
	}

	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		origins = append(origins, origin)
	}

	return origins
}

func parseBool(value string) bool {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}
