GO ?= go
MIGRATE_ARGS ?= up

.PHONY: migrate migrate-up migrate-status run test build

migrate:
	$(GO) run ./cmd/migrate $(MIGRATE_ARGS)

migrate-up:
	$(GO) run ./cmd/migrate up

migrate-status:
	$(GO) run ./cmd/migrate status

run: migrate-up
	$(GO) run ./cmd/api

test:
	$(GO) test ./...

build:
	$(GO) build ./...
