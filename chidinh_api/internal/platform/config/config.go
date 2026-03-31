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

	ownerUsername := os.Getenv("OWNER_USERNAME")
	if ownerUsername == "" {
		ownerUsername = "owner"
	}

	ownerPasswordHash := os.Getenv("OWNER_PASSWORD_HASH")
	if ownerPasswordHash == "" {
		ownerPasswordHash = "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC"
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
		OwnerPasswordHash:  ownerPasswordHash,
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
