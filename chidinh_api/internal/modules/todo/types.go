package todo

import (
	"strings"
	"time"
)

type Item struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateRequest struct {
	Title string `json:"title" validate:"required,max=200"`
}

type UpdateRequest struct {
	Title     *string `json:"title,omitempty" validate:"omitempty,notblank,max=200"`
	Completed *bool   `json:"completed,omitempty"`
}

func (r *CreateRequest) Normalize() {
	r.Title = strings.TrimSpace(r.Title)
}

func (r *UpdateRequest) Normalize() {
	if r.Title == nil {
		return
	}

	trimmed := strings.TrimSpace(*r.Title)
	r.Title = &trimmed
}

func (r *UpdateRequest) ValidateFields(report func(field string, tag string)) {
	if r.Title == nil && r.Completed == nil {
		report("update", "required")
	}
}
