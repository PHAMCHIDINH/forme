package journal

import (
	"encoding/json"
	"errors"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"
)

var (
	ErrInvalidType       = errors.New("type is required")
	ErrInvalidTitle      = errors.New("title is required")
	ErrTitleTooLong      = errors.New("title must be at most 200 characters")
	ErrInvalidConsumedOn = errors.New("consumedOn is required")
	ErrInvalidImageURL   = errors.New("image URL is invalid")
	ErrInvalidSourceURL  = errors.New("source URL is invalid")
	ErrInvalidUpdate     = errors.New("at least one field is required")
	ErrNotFound          = errors.New("journal entry not found")
)

type EntryType string

const (
	EntryTypeBook  EntryType = "book"
	EntryTypeVideo EntryType = "video"
)

const dateOnlyLayout = "2006-01-02"

type DateOnly struct {
	time.Time
}

func DateOnlyFromTime(ts time.Time) DateOnly {
	return DateOnly{
		Time: time.Date(ts.Year(), ts.Month(), ts.Day(), 0, 0, 0, 0, time.UTC),
	}
}

func (d DateOnly) MarshalJSON() ([]byte, error) {
	if d.Time.IsZero() {
		return nil, errors.New("date is required")
	}

	return json.Marshal(d.Time.UTC().Format(dateOnlyLayout))
}

func (d *DateOnly) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	raw = strings.TrimSpace(raw)
	if raw == "" {
		return errors.New("date is required")
	}

	parsed, err := time.Parse(dateOnlyLayout, raw)
	if err != nil {
		return err
	}

	d.Time = DateOnlyFromTime(parsed).Time
	return nil
}

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

type Entry struct {
	ID         string     `json:"id"`
	Type       EntryType  `json:"type"`
	Title      string     `json:"title"`
	ImageURL   *string    `json:"imageUrl,omitempty"`
	SourceURL  *string    `json:"sourceUrl,omitempty"`
	Review     *string    `json:"review,omitempty"`
	ConsumedOn DateOnly   `json:"consumedOn"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

type CreateParams struct {
	Type       EntryType  `json:"type" validate:"required,oneof=book video"`
	Title      string     `json:"title" validate:"required,notblank,max=200"`
	ImageURL   *string    `json:"imageUrl,omitempty" validate:"omitempty"`
	SourceURL  *string    `json:"sourceUrl,omitempty" validate:"omitempty,url"`
	Review     *string    `json:"review,omitempty"`
	ConsumedOn DateOnly   `json:"consumedOn" validate:"required"`
}

type UpdateParams struct {
	Type       PatchField[EntryType] `json:"type,omitempty"`
	Title      PatchField[string]    `json:"title,omitempty"`
	ImageURL   PatchField[string]    `json:"imageUrl,omitempty"`
	SourceURL  PatchField[string]    `json:"sourceUrl,omitempty"`
	Review     PatchField[string]    `json:"review,omitempty"`
	ConsumedOn PatchField[DateOnly]  `json:"consumedOn,omitempty"`
}

type CreateRequest struct {
	Type       EntryType  `json:"type" validate:"required,oneof=book video"`
	Title      string     `json:"title" validate:"required,notblank,max=200"`
	ImageURL   *string    `json:"imageUrl,omitempty" validate:"omitempty"`
	SourceURL  *string    `json:"sourceUrl,omitempty" validate:"omitempty,url"`
	Review     *string    `json:"review,omitempty"`
	ConsumedOn DateOnly   `json:"consumedOn" validate:"required"`
}

type UpdateRequest struct {
	Type       PatchField[EntryType] `json:"type,omitempty"`
	Title      PatchField[string]    `json:"title,omitempty"`
	ImageURL   PatchField[string]    `json:"imageUrl,omitempty"`
	SourceURL  PatchField[string]    `json:"sourceUrl,omitempty"`
	Review     PatchField[string]    `json:"review,omitempty"`
	ConsumedOn PatchField[DateOnly]  `json:"consumedOn,omitempty"`
}

func (r *CreateRequest) Normalize() {
	r.Type = EntryType(strings.ToLower(strings.TrimSpace(string(r.Type))))
	r.Title = strings.TrimSpace(r.Title)
	if r.ImageURL != nil {
		trimmed := strings.TrimSpace(*r.ImageURL)
		r.ImageURL = &trimmed
	}
	if r.SourceURL != nil {
		trimmed := strings.TrimSpace(*r.SourceURL)
		r.SourceURL = &trimmed
	}
	if !r.ConsumedOn.Time.IsZero() {
		r.ConsumedOn = DateOnlyFromTime(r.ConsumedOn.Time)
	}
}

func (r *CreateRequest) ValidateFields(report func(field string, tag string)) {
	if strings.TrimSpace(r.Title) == "" {
		report("title", "notblank")
	}
	if utf8.RuneCountInString(strings.TrimSpace(r.Title)) > 200 {
		report("title", "max")
	}
}

func (r CreateRequest) ToParams() CreateParams {
	return CreateParams{
		Type:       r.Type,
		Title:      r.Title,
		ImageURL:   cloneStringPtr(r.ImageURL),
		SourceURL:  cloneStringPtr(r.SourceURL),
		Review:     cloneStringPtr(r.Review),
		ConsumedOn: r.ConsumedOn,
	}
}

func (r UpdateRequest) ToParams() UpdateParams {
	return UpdateParams{
		Type:       r.Type,
		Title:      r.Title,
		ImageURL:   r.ImageURL,
		SourceURL:  r.SourceURL,
		Review:     r.Review,
		ConsumedOn: r.ConsumedOn,
	}
}

func (p *CreateParams) Normalize() {
	p.Type = EntryType(strings.ToLower(strings.TrimSpace(string(p.Type))))
	p.Title = strings.TrimSpace(p.Title)
	if p.ImageURL != nil {
		trimmed := strings.TrimSpace(*p.ImageURL)
		p.ImageURL = &trimmed
	}
	if p.SourceURL != nil {
		trimmed := strings.TrimSpace(*p.SourceURL)
		p.SourceURL = &trimmed
	}
	if !p.ConsumedOn.Time.IsZero() {
		p.ConsumedOn = DateOnlyFromTime(p.ConsumedOn.Time)
	}
}

func (r *UpdateRequest) Normalize() {
	if r.Type.Present && !r.Type.Null {
		r.Type.Value = EntryType(strings.ToLower(strings.TrimSpace(string(r.Type.Value))))
	}
	if r.Title.Present && !r.Title.Null {
		r.Title.Value = strings.TrimSpace(r.Title.Value)
	}
	if r.ImageURL.Present && !r.ImageURL.Null {
		r.ImageURL.Value = strings.TrimSpace(r.ImageURL.Value)
	}
	if r.SourceURL.Present && !r.SourceURL.Null {
		r.SourceURL.Value = strings.TrimSpace(r.SourceURL.Value)
	}
	if r.ConsumedOn.Present && !r.ConsumedOn.Null {
		r.ConsumedOn.Value = DateOnlyFromTime(r.ConsumedOn.Value.Time)
	}
}

func (r *UpdateRequest) ValidateFields(report func(field string, tag string)) {
	if !r.Type.Present && !r.Title.Present && !r.ImageURL.Present && !r.SourceURL.Present && !r.Review.Present && !r.ConsumedOn.Present {
		report("update", "required")
	}

	if r.Type.Present {
		if r.Type.Null {
			report("type", "required")
		} else if normalized := EntryType(strings.ToLower(strings.TrimSpace(string(r.Type.Value)))); normalized != EntryTypeBook && normalized != EntryTypeVideo {
			report("type", "oneof")
		}
	}

	if r.Title.Present {
		if r.Title.Null || strings.TrimSpace(r.Title.Value) == "" {
			report("title", "notblank")
		}
		if utf8.RuneCountInString(strings.TrimSpace(r.Title.Value)) > 200 {
			report("title", "max")
		}
	}

	if r.ConsumedOn.Present && r.ConsumedOn.Null {
		report("consumedOn", "required")
	}
}

func (p *UpdateParams) Normalize() {
	if p.Type.Present && !p.Type.Null {
		p.Type.Value = EntryType(strings.ToLower(strings.TrimSpace(string(p.Type.Value))))
	}
	if p.Title.Present && !p.Title.Null {
		p.Title.Value = strings.TrimSpace(p.Title.Value)
	}
	if p.ImageURL.Present && !p.ImageURL.Null {
		p.ImageURL.Value = strings.TrimSpace(p.ImageURL.Value)
	}
	if p.SourceURL.Present && !p.SourceURL.Null {
		p.SourceURL.Value = strings.TrimSpace(p.SourceURL.Value)
	}
	if p.ConsumedOn.Present && !p.ConsumedOn.Null {
		p.ConsumedOn.Value = DateOnlyFromTime(p.ConsumedOn.Value.Time)
	}
}

func cloneStringPtr(value *string) *string {
	if value == nil {
		return nil
	}

	clone := *value
	return &clone
}

func normalizeEntryType(value EntryType) (EntryType, error) {
	switch EntryType(strings.ToLower(strings.TrimSpace(string(value)))) {
	case EntryTypeBook:
		return EntryTypeBook, nil
	case EntryTypeVideo:
		return EntryTypeVideo, nil
	default:
		return "", ErrInvalidType
	}
}

func normalizeTitle(value string) (string, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "", ErrInvalidTitle
	}
	if utf8.RuneCountInString(trimmed) > 200 {
		return "", ErrTitleTooLong
	}

	return trimmed, nil
}

func normalizeDateOnly(value DateOnly) (DateOnly, error) {
	if value.Time.IsZero() {
		return DateOnly{}, ErrInvalidConsumedOn
	}

	return DateOnlyFromTime(value.Time), nil
}

func normalizeURL(value string, invalidErr error, allowRelative bool) (string, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "", invalidErr
	}

	parsed, err := url.Parse(trimmed)
	if err != nil {
		return "", invalidErr
	}
	if allowRelative {
		if parsed.Scheme == "" && parsed.Host == "" && strings.HasPrefix(parsed.Path, "/uploads/images/") {
			return trimmed, nil
		}
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return "", invalidErr
	}
	if parsed.Host == "" {
		return "", invalidErr
	}

	return trimmed, nil
}
