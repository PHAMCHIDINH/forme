package config

import (
	"os"
	"strings"
)

type Config struct {
	Port               string
	AppEnv             string
	DatabaseURL        string
	JWTSecret          string
	OwnerUsername      string
	OwnerPassword      string
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

	ownerUsername := os.Getenv("OWNER_USERNAME")
	if ownerUsername == "" {
		ownerUsername = "owner"
	}

	ownerPassword := os.Getenv("OWNER_PASSWORD")
	if ownerPassword == "" {
		ownerPassword = "owner123"
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
		OwnerUsername:      ownerUsername,
		OwnerPassword:      ownerPassword,
		CORSAllowedOrigins: parseCSVEnv("CORS_ALLOWED_ORIGINS"),
		CookieSecure:       parseBool(os.Getenv("COOKIE_SECURE")),
		CookieSameSite:     cookieSameSite,
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
