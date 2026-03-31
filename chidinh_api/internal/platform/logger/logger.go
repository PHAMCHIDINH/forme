package logger

import (
	"io"
	"log/slog"
	"os"
	"strings"
)

func New(appEnv string) *slog.Logger {
	return NewWithWriter(appEnv, os.Stdout)
}

func NewWithWriter(appEnv string, writer io.Writer) *slog.Logger {
	handler := slog.NewJSONHandler(writer, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})

	return slog.New(handler).With(
		slog.String("app_env", strings.TrimSpace(appEnv)),
	)
}
