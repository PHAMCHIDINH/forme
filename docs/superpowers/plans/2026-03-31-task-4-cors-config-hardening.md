# Task 4: CORS + Config Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CORS deny by default when no origin is explicitly allowed, and add fast-fail config validation for the API boot path without changing migrate behavior.

**Architecture:** Keep the current middleware and config package shape. Tighten CORS matching so only allowlisted origins receive CORS headers, add `Config.Validate()` for required API runtime values, and call that validation only from `cmd/api/main.go`.

**Tech Stack:** Go, chi, net/http, testing

---

### Task 1: Tighten CORS behavior

**Files:**
- Modify: `chidinh_api/internal/platform/middleware/cors.go`
- Create/Modify: `chidinh_api/internal/platform/middleware/cors_test.go`

- [ ] Write tests for allowed origin, unknown origin, and preflight handling.
- [ ] Implement strict allowlist matching so an empty list does not emit ACAO or credentials headers.
- [ ] Run the middleware tests and confirm they pass.

### Task 2: Add config validation and API startup gate

**Files:**
- Modify: `chidinh_api/internal/platform/config/config.go`
- Create/Modify: `chidinh_api/internal/platform/config/config_test.go`
- Modify: `chidinh_api/cmd/api/main.go`

- [ ] Write tests for successful config loading plus missing required key validation failures.
- [ ] Implement `Config.Validate()` for the API runtime values used by auth, boot, and seeding.
- [ ] Call validation from the API entrypoint only, leaving `cmd/migrate/main.go` unchanged.
- [ ] Run package tests and the full Go build.

