package todo

import (
	"encoding/json"
	"strings"
	"time"
)

type Status string

const (
	StatusTodo       Status = "todo"
	StatusInProgress Status = "in_progress"
	StatusDone       Status = "done"
	StatusCancelled  Status = "cancelled"
)

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type PatchField[T any] struct {
	Present bool
	Null    bool
	Value   T
}

func NewPatchValue[T any](value T) PatchField[T] {
	return PatchField[T]{
		Present: true,
		Value:   value,
	}
}

func NewPatchNull[T any]() PatchField[T] {
	return PatchField[T]{
		Present: true,
		Null:    true,
	}
}

func (f PatchField[T]) HasValue() bool {
	return f.Present && !f.Null
}

func (f PatchField[T]) IsNull() bool {
	return f.Present && f.Null
}

func (f PatchField[T]) IsZero() bool {
	return !f.Present
}

func (f *PatchField[T]) Clear() {
	var zero T
	f.Present = true
	f.Null = true
	f.Value = zero
}

func (f *PatchField[T]) Set(value T) {
	f.Present = true
	f.Null = false
	f.Value = value
}

func (f *PatchField[T]) UnmarshalJSON(data []byte) error {
	f.Present = true
	if string(data) == "null" {
		f.Null = true
		var zero T
		f.Value = zero
		return nil
	}

	f.Null = false
	return json.Unmarshal(data, &f.Value)
}

func (f PatchField[T]) MarshalJSON() ([]byte, error) {
	if !f.Present || f.Null {
		return []byte("null"), nil
	}

	return json.Marshal(f.Value)
}

type Item struct {
	ID              string     `json:"id"`
	Title           string     `json:"title"`
	DescriptionHtml string     `json:"descriptionHtml,omitempty"`
	Status          Status     `json:"status,omitempty"`
	Priority        Priority   `json:"priority,omitempty"`
	DueAt           *time.Time `json:"dueAt,omitempty"`
	Tags            []string   `json:"tags,omitempty"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
	ArchivedAt      *time.Time `json:"archivedAt,omitempty"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
	Completed       bool       `json:"completed,omitempty"`
}

type CreateParams struct {
	Title           string     `json:"title" validate:"required,notblank,max=200"`
	DescriptionHtml string     `json:"descriptionHtml,omitempty"`
	Status          Status     `json:"status,omitempty" validate:"omitempty,oneof=todo in_progress done cancelled"`
	Priority        Priority   `json:"priority,omitempty" validate:"omitempty,oneof=low medium high"`
	DueAt           *time.Time `json:"dueAt,omitempty"`
	Tags            []string   `json:"tags,omitempty"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
	ArchivedAt      *time.Time `json:"archivedAt,omitempty"`
}

type UpdateParams struct {
	Title           PatchField[string]    `json:"title,omitempty"`
	DescriptionHtml PatchField[string]    `json:"descriptionHtml,omitempty"`
	Status          PatchField[Status]    `json:"status,omitempty"`
	Priority        PatchField[Priority]  `json:"priority,omitempty"`
	DueAt           PatchField[time.Time] `json:"dueAt,omitempty"`
	Tags            PatchField[[]string]  `json:"tags,omitempty"`
	CompletedAt     PatchField[time.Time] `json:"completedAt,omitempty"`
	ArchivedAt      PatchField[time.Time] `json:"archivedAt,omitempty"`
}

type CreateRequest struct {
	Title           string     `json:"title" validate:"required,notblank,max=200"`
	DescriptionHtml string     `json:"descriptionHtml,omitempty"`
	Status          Status     `json:"status,omitempty" validate:"omitempty,oneof=todo in_progress done cancelled"`
	Priority        Priority   `json:"priority,omitempty" validate:"omitempty,oneof=low medium high"`
	DueAt           *time.Time `json:"dueAt,omitempty"`
	Tags            []string   `json:"tags,omitempty"`
	ArchivedAt      *time.Time `json:"archivedAt,omitempty"`
}

type UpdateRequest struct {
	Title           PatchField[string]    `json:"title,omitempty"`
	DescriptionHtml PatchField[string]    `json:"descriptionHtml,omitempty"`
	Status          PatchField[Status]    `json:"status,omitempty"`
	Priority        PatchField[Priority]  `json:"priority,omitempty"`
	DueAt           PatchField[time.Time] `json:"dueAt,omitempty"`
	Tags            PatchField[[]string]  `json:"tags,omitempty"`
	ArchivedAt      PatchField[time.Time] `json:"archivedAt,omitempty"`
}

func (p *CreateParams) Normalize() {
	p.Title = strings.TrimSpace(p.Title)
	p.Tags = normalizeTags(p.Tags)
}

func (p *UpdateParams) Normalize() {
	if p.Title.Present && !p.Title.Null {
		p.Title.Value = strings.TrimSpace(p.Title.Value)
	}
	if p.Tags.Present && !p.Tags.Null {
		p.Tags.Value = normalizeTags(p.Tags.Value)
	}
}

func (p *UpdateParams) ValidateFields(report func(field string, tag string)) {
	if !p.Title.Present && !p.DescriptionHtml.Present && !p.Status.Present && !p.Priority.Present && !p.DueAt.Present && !p.Tags.Present && !p.CompletedAt.Present && !p.ArchivedAt.Present {
		report("update", "required")
	}
	if p.Title.Present {
		if p.Title.Null {
			report("title", "notblank")
		} else {
			trimmed := strings.TrimSpace(p.Title.Value)
			if trimmed == "" {
				report("title", "notblank")
			}
			if len(trimmed) > 200 {
				report("title", "max")
			}
		}
	}
	if p.Status.Present && !p.Status.Null && !isValidStatus(p.Status.Value) {
		report("status", "oneof")
	}
	if p.Priority.Present && !p.Priority.Null && !isValidPriority(p.Priority.Value) {
		report("priority", "oneof")
	}
}

func (r *CreateRequest) Normalize() {
	r.Title = strings.TrimSpace(r.Title)
	r.Tags = normalizeTags(r.Tags)
}

func (r CreateRequest) ToParams() CreateParams {
	return CreateParams{
		Title:           r.Title,
		DescriptionHtml: r.DescriptionHtml,
		Status:          r.Status,
		Priority:        r.Priority,
		DueAt:           r.DueAt,
		Tags:            append([]string(nil), r.Tags...),
		ArchivedAt:      r.ArchivedAt,
	}
}

func (r *UpdateRequest) Normalize() {
	if r.Title.Present && !r.Title.Null {
		r.Title.Value = strings.TrimSpace(r.Title.Value)
	}
	if r.Tags.Present && !r.Tags.Null {
		r.Tags.Value = normalizeTags(r.Tags.Value)
	}
}

func (r *UpdateRequest) ValidateFields(report func(field string, tag string)) {
	if !r.Title.Present && !r.DescriptionHtml.Present && !r.Status.Present && !r.Priority.Present && !r.DueAt.Present && !r.Tags.Present && !r.ArchivedAt.Present {
		report("update", "required")
	}
	if r.Title.Present {
		if r.Title.Null {
			report("title", "notblank")
		} else {
			trimmed := strings.TrimSpace(r.Title.Value)
			if trimmed == "" {
				report("title", "notblank")
			}
			if len(trimmed) > 200 {
				report("title", "max")
			}
		}
	}
	if r.Status.Present && !r.Status.Null && !isValidStatus(r.Status.Value) {
		report("status", "oneof")
	}
	if r.Priority.Present && !r.Priority.Null && !isValidPriority(r.Priority.Value) {
		report("priority", "oneof")
	}
}

func (r UpdateRequest) ToParams() UpdateParams {
	return UpdateParams{
		Title:           r.Title,
		DescriptionHtml: r.DescriptionHtml,
		Status:          r.Status,
		Priority:        r.Priority,
		DueAt:           r.DueAt,
		Tags:            r.Tags,
		ArchivedAt:      r.ArchivedAt,
	}
}

func (p UpdateParams) MarshalJSON() ([]byte, error) {
	out := make(map[string]any)
	if p.Title.Present {
		if p.Title.Null {
			out["title"] = nil
		} else {
			out["title"] = p.Title.Value
		}
	}
	if p.DescriptionHtml.Present {
		if p.DescriptionHtml.Null {
			out["descriptionHtml"] = nil
		} else {
			out["descriptionHtml"] = p.DescriptionHtml.Value
		}
	}
	if p.Status.Present {
		if p.Status.Null {
			out["status"] = nil
		} else {
			out["status"] = p.Status.Value
		}
	}
	if p.Priority.Present {
		if p.Priority.Null {
			out["priority"] = nil
		} else {
			out["priority"] = p.Priority.Value
		}
	}
	if p.DueAt.Present {
		if p.DueAt.Null {
			out["dueAt"] = nil
		} else {
			out["dueAt"] = p.DueAt.Value
		}
	}
	if p.Tags.Present {
		if p.Tags.Null {
			out["tags"] = nil
		} else {
			out["tags"] = p.Tags.Value
		}
	}
	if p.CompletedAt.Present {
		if p.CompletedAt.Null {
			out["completedAt"] = nil
		} else {
			out["completedAt"] = p.CompletedAt.Value
		}
	}
	if p.ArchivedAt.Present {
		if p.ArchivedAt.Null {
			out["archivedAt"] = nil
		} else {
			out["archivedAt"] = p.ArchivedAt.Value
		}
	}

	return json.Marshal(out)
}

func isValidStatus(status Status) bool {
	switch status {
	case StatusTodo, StatusInProgress, StatusDone, StatusCancelled:
		return true
	default:
		return false
	}
}

func isValidPriority(priority Priority) bool {
	switch priority {
	case PriorityLow, PriorityMedium, PriorityHigh:
		return true
	default:
		return false
	}
}
