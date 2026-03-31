GO ?= go
MIGRATE_ARGS ?= up

.PHONY: migrate migrate-status run test build

migrate:
	$(GO) run ./cmd/migrate $(MIGRATE_ARGS)

migrate-status:
	$(GO) run ./cmd/migrate status

run:
	$(GO) run ./cmd/api

test:
	$(GO) test ./...

build:
	$(GO) build ./...
