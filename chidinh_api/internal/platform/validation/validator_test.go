package validation_test

import (
	"strings"
	"testing"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/todo"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/validation"
)

func TestValidatorTrimsAndValidatesLoginRequest(t *testing.T) {
	validator := validation.New()
	req := auth.LoginRequest{
		Username: "   ",
		Password: "   ",
	}

	errs := validator.Validate(&req)

	if !errs.Has("username", "required") {
		t.Fatalf("expected username required validation error, got %#v", errs)
	}
	if !errs.Has("password", "required") {
		t.Fatalf("expected password required validation error, got %#v", errs)
	}
}

func TestValidatorEnforcesTodoRequestRules(t *testing.T) {
	validator := validation.New()

	createReq := todo.CreateRequest{Title: strings.Repeat("a", 201)}
	createErrs := validator.Validate(&createReq)
	if !createErrs.Has("title", "max") {
		t.Fatalf("expected title max validation error, got %#v", createErrs)
	}

	updateReq := todo.UpdateRequest{}
	updateErrs := validator.Validate(&updateReq)
	if !updateErrs.Has("update", "required") {
		t.Fatalf("expected update required validation error, got %#v", updateErrs)
	}
}
