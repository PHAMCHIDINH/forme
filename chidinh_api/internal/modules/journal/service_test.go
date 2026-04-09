package journal

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"
)

func TestServiceCreateNormalizesAndDelegates(t *testing.T) {
	store := &captureJournalStore{}
	svc := NewService(store)
	imageURL := " https://example.com/image.jpg "
	sourceURL := " https://example.com/book "
	review := "  Great read  "

	got, err := svc.Create(context.Background(), "owner-123", CreateParams{
		Type:       " BOOK ",
		Title:      "  The Book  ",
		ImageURL:   &imageURL,
		SourceURL:  &sourceURL,
		Review:     &review,
		ConsumedOn: DateOnlyFromTime(time.Date(2026, 4, 2, 15, 30, 0, 0, time.FixedZone("UTC+2", 2*60*60))),
	})
	if err != nil {
		t.Fatalf("expected create to succeed, got error: %v", err)
	}

	if got.Type != EntryTypeBook {
		t.Fatalf("expected normalized type to be book, got %#v", got.Type)
	}
	if got.Title != "The Book" {
		t.Fatalf("expected trimmed title, got %#v", got.Title)
	}
	if got.ImageURL == nil || *got.ImageURL != "https://example.com/image.jpg" {
		t.Fatalf("expected normalized image URL, got %#v", got.ImageURL)
	}
	if got.SourceURL == nil || *got.SourceURL != "https://example.com/book" {
		t.Fatalf("expected normalized source URL, got %#v", got.SourceURL)
	}
	if got.Review == nil || *got.Review != review {
		t.Fatalf("expected review to be forwarded unchanged, got %#v", got.Review)
	}
	if !got.ConsumedOn.Equal(time.Date(2026, 4, 2, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected consumedOn to normalize to UTC midnight, got %#v", got.ConsumedOn)
	}

	if len(store.createParams) != 1 {
		t.Fatalf("expected create to be delegated once, got %#v", store.createParams)
	}
	params := store.createParams[0]
	if params.Type != EntryTypeBook || params.Title != "The Book" {
		t.Fatalf("expected normalized create params, got %#v", params)
	}
	if params.ImageURL == nil || *params.ImageURL != "https://example.com/image.jpg" {
		t.Fatalf("expected normalized image URL to be persisted, got %#v", params.ImageURL)
	}
	if params.SourceURL == nil || *params.SourceURL != "https://example.com/book" {
		t.Fatalf("expected normalized source URL to be persisted, got %#v", params.SourceURL)
	}
}

func TestServiceCreateRejectsInvalidFields(t *testing.T) {
	svc := NewService(&captureJournalStore{})

	_, err := svc.Create(context.Background(), "owner-123", CreateParams{
		Type:       "podcast",
		Title:      "Launch notes",
		ConsumedOn: DateOnlyFromTime(time.Date(2026, 4, 2, 0, 0, 0, 0, time.UTC)),
	})
	if !errors.Is(err, ErrInvalidType) {
		t.Fatalf("expected invalid type error, got %v", err)
	}

	badURL := "not-a-url"
	_, err = svc.Create(context.Background(), "owner-123", CreateParams{
		Type:       EntryTypeVideo,
		Title:      "Launch notes",
		ImageURL:   &badURL,
		ConsumedOn: DateOnlyFromTime(time.Date(2026, 4, 2, 0, 0, 0, 0, time.UTC)),
	})
	if !errors.Is(err, ErrInvalidImageURL) {
		t.Fatalf("expected invalid image URL error, got %v", err)
	}

	_, err = svc.Create(context.Background(), "owner-123", CreateParams{
		Type:       EntryTypeVideo,
		Title:      "   ",
		ConsumedOn: DateOnlyFromTime(time.Date(2026, 4, 2, 0, 0, 0, 0, time.UTC)),
	})
	if !errors.Is(err, ErrInvalidTitle) {
		t.Fatalf("expected invalid title error, got %v", err)
	}
}

func TestServiceCreateRejectsTitleLongByRunes(t *testing.T) {
	svc := NewService(&captureJournalStore{})
	longTitle := strings.Repeat("界", 201)

	_, err := svc.Create(context.Background(), "owner-123", CreateParams{
		Type:       EntryTypeBook,
		Title:      longTitle,
		ConsumedOn: DateOnlyFromTime(time.Date(2026, 4, 2, 0, 0, 0, 0, time.UTC)),
	})
	if !errors.Is(err, ErrTitleTooLong) {
		t.Fatalf("expected long title error, got %v", err)
	}
}

func TestServiceUpdateNormalizesPatchAndDelegates(t *testing.T) {
	store := &captureJournalStore{}
	svc := NewService(store)
	imageURL := " https://example.com/new-image.jpg "
	sourceURL := " https://example.com/new-source "
	consumedOn := DateOnlyFromTime(time.Date(2026, 4, 4, 9, 15, 0, 0, time.FixedZone("UTC-5", -5*60*60)))

	got, err := svc.Update(context.Background(), "owner-123", "11111111-1111-1111-1111-111111111111", UpdateParams{
		Type:       NewPatchValue(EntryTypeVideo),
		Title:      NewPatchValue("  Watch later  "),
		ImageURL:   NewPatchValue(imageURL),
		SourceURL:  NewPatchValue(sourceURL),
		Review:     NewPatchValue("  still useful  "),
		ConsumedOn: NewPatchValue(consumedOn),
	})
	if err != nil {
		t.Fatalf("expected update to succeed, got error: %v", err)
	}

	if got.Type != EntryTypeVideo || got.Title != "Watch later" {
		t.Fatalf("expected normalized update response, got %#v", got)
	}
	if got.ImageURL == nil || *got.ImageURL != "https://example.com/new-image.jpg" {
		t.Fatalf("expected normalized image URL, got %#v", got.ImageURL)
	}
	if got.SourceURL == nil || *got.SourceURL != "https://example.com/new-source" {
		t.Fatalf("expected normalized source URL, got %#v", got.SourceURL)
	}
	if !got.ConsumedOn.Equal(time.Date(2026, 4, 4, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected consumedOn to normalize, got %#v", got.ConsumedOn)
	}

	if len(store.updateParams) != 1 {
		t.Fatalf("expected update to be delegated once, got %#v", store.updateParams)
	}
	params := store.updateParams[0]
	if !params.Type.HasValue() || params.Type.Value != EntryTypeVideo {
		t.Fatalf("expected normalized type patch, got %#v", params.Type)
	}
	if !params.Title.HasValue() || params.Title.Value != "Watch later" {
		t.Fatalf("expected normalized title patch, got %#v", params.Title)
	}
	if !params.ImageURL.HasValue() || params.ImageURL.Value != "https://example.com/new-image.jpg" {
		t.Fatalf("expected normalized image URL patch, got %#v", params.ImageURL)
	}
	if !params.ConsumedOn.HasValue() || !params.ConsumedOn.Value.Equal(time.Date(2026, 4, 4, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected normalized consumedOn patch, got %#v", params.ConsumedOn)
	}
}

func TestServiceUpdateRejectsEmptyPatch(t *testing.T) {
	svc := NewService(&captureJournalStore{})

	_, err := svc.Update(context.Background(), "owner-123", "11111111-1111-1111-1111-111111111111", UpdateParams{})
	if !errors.Is(err, ErrInvalidUpdate) {
		t.Fatalf("expected empty patch error, got %v", err)
	}
}

func TestDateOnlyJSONRoundTrip(t *testing.T) {
	original := DateOnlyFromTime(time.Date(2026, 4, 5, 19, 45, 0, 0, time.FixedZone("UTC+7", 7*60*60)))
	encoded, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("marshal date only: %v", err)
	}

	var decoded DateOnly
	if err := json.Unmarshal(encoded, &decoded); err != nil {
		t.Fatalf("unmarshal date only: %v", err)
	}

	if !decoded.Equal(time.Date(2026, 4, 5, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("expected normalized date to round-trip, got %#v", decoded)
	}
}

type captureJournalStore struct {
	listItems    []Entry
	createParams []CreateParams
	updateParams []UpdateParams
	deleteCalls  []string
}

func (s *captureJournalStore) List(_ context.Context, _ string) ([]Entry, error) {
	return append([]Entry(nil), s.listItems...), nil
}

func (s *captureJournalStore) Create(_ context.Context, _ string, params CreateParams) (Entry, error) {
	s.createParams = append(s.createParams, params)
	return Entry{
		Type:       params.Type,
		Title:      params.Title,
		ImageURL:   cloneStringPtr(params.ImageURL),
		SourceURL:  cloneStringPtr(params.SourceURL),
		Review:     cloneStringPtr(params.Review),
		ConsumedOn: params.ConsumedOn,
	}, nil
}

func (s *captureJournalStore) Update(_ context.Context, _ string, _ string, params UpdateParams) (Entry, error) {
	s.updateParams = append(s.updateParams, params)
	return Entry{
		Type:       valueOrEntryType(params.Type),
		Title:      valueOrString(params.Title),
		ImageURL:   fieldValueOrStringPtr(params.ImageURL),
		SourceURL:  fieldValueOrStringPtr(params.SourceURL),
		Review:     fieldValueOrStringPtr(params.Review),
		ConsumedOn: fieldValueOrDateOnly(params.ConsumedOn),
	}, nil
}

func (s *captureJournalStore) Delete(_ context.Context, _ string, entryID string) error {
	s.deleteCalls = append(s.deleteCalls, entryID)
	return nil
}

func valueOrEntryType(field PatchField[EntryType]) EntryType {
	if field.HasValue() {
		return field.Value
	}
	return ""
}

func valueOrString(field PatchField[string]) string {
	if field.HasValue() {
		return field.Value
	}
	return ""
}

func fieldValueOrStringPtr(field PatchField[string]) *string {
	if field.HasValue() {
		return cloneStringPtr(&field.Value)
	}
	return nil
}

func fieldValueOrDateOnly(field PatchField[DateOnly]) DateOnly {
	if field.HasValue() {
		return field.Value
	}
	return DateOnly{}
}
