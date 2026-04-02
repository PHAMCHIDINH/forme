package todo

import (
	"context"
	"encoding/json"
	"errors"
	"reflect"
	"testing"
	"time"
)

func TestServiceListV2ForwardsFilters(t *testing.T) {
	store := &captureTodoStore{
		listItems: []Item{
			{ID: "todo-1", Title: "Today", Status: StatusTodo},
		},
	}
	svc := NewService(store)

	got, err := svc.ListV2(context.Background(), "owner-123", ListOptions{
		View:   "today",
		Search: "launch",
		Tag:    "work",
		Status: StatusInProgress,
	})
	if err != nil {
		t.Fatalf("expected list v2 to succeed, got error: %v", err)
	}

	if len(got) != 1 || got[0].ID != "todo-1" {
		t.Fatalf("expected list v2 to return seeded todo, got %#v", got)
	}
	if len(store.listOpts) != 1 {
		t.Fatalf("expected list v2 to call the store once, got %#v", store.listOpts)
	}
	if got := store.listOpts[0]; got.View != "today" || got.Search != "launch" || got.Tag != "work" || got.Status != StatusInProgress {
		t.Fatalf("expected v2 filters to be forwarded, got %#v", got)
	}
}

func TestServiceCreateV2NormalizesRichPayload(t *testing.T) {
	store := &captureTodoStore{}
	svc := NewService(store)
	dueAt := time.Date(2026, 4, 2, 15, 0, 0, 0, time.UTC)
	archivedAt := time.Date(2026, 4, 2, 18, 0, 0, 0, time.UTC)

	got, err := svc.CreateV2(context.Background(), "owner-123", CreateParams{
		Title:           "  Launch plan  ",
		DescriptionHtml: "<p>Plan launch</p>",
		Status:          StatusDone,
		Priority:        PriorityHigh,
		DueAt:           &dueAt,
		Tags:            []string{" Work ", "launch", "work"},
		ArchivedAt:      &archivedAt,
	})
	if err != nil {
		t.Fatalf("expected create v2 to succeed, got error: %v", err)
	}

	if got.Title != "Launch plan" {
		t.Fatalf("expected returned title to be normalized, got %#v", got.Title)
	}
	if len(store.createParams) != 1 {
		t.Fatalf("expected create v2 to call the store once, got %#v", store.createParams)
	}
	params := store.createParams[0]
	if params.Title != "Launch plan" {
		t.Fatalf("expected trimmed title to be persisted, got %#v", params.Title)
	}
	if params.Status != StatusDone {
		t.Fatalf("expected done status to be persisted, got %#v", params.Status)
	}
	if params.Priority != PriorityHigh {
		t.Fatalf("expected priority to be persisted, got %#v", params.Priority)
	}
	if params.CompletedAt == nil {
		t.Fatal("expected completedAt to be populated for done create")
	}
	if !reflect.DeepEqual(params.Tags, []string{"work", "launch"}) {
		t.Fatalf("expected normalized tags to be persisted, got %#v", params.Tags)
	}
	if params.ArchivedAt == nil || !params.ArchivedAt.Equal(archivedAt) {
		t.Fatalf("expected archivedAt to be persisted, got %#v", params.ArchivedAt)
	}
}

func TestServiceCreateV2IgnoresCallerSuppliedCompletedAt(t *testing.T) {
	store := &captureTodoStore{}
	svc := NewService(store)
	suppliedCompletedAt := time.Date(2026, 4, 2, 16, 0, 0, 0, time.UTC)

	_, err := svc.CreateV2(context.Background(), "owner-123", CreateParams{
		Title:       "Finish release",
		Status:      StatusDone,
		CompletedAt: &suppliedCompletedAt,
	})
	if err != nil {
		t.Fatalf("expected create v2 to succeed, got error: %v", err)
	}
	if len(store.createParams) != 1 {
		t.Fatalf("expected create v2 to call the store once, got %#v", store.createParams)
	}
	params := store.createParams[0]
	if params.CompletedAt == nil {
		t.Fatal("expected server-managed completedAt to be populated")
	}
	if params.CompletedAt.Equal(suppliedCompletedAt) {
		t.Fatalf("expected caller completedAt to be ignored, got %#v", params.CompletedAt)
	}
}

func TestServiceUpdateV2SetsCompletedAtWhenStatusBecomesDone(t *testing.T) {
	store := &captureTodoStore{}
	svc := NewService(store)

	_, err := svc.UpdateV2(context.Background(), "owner-123", "todo-1", UpdateParams{
		Title:  NewPatchValue("Finish release"),
		Status: NewPatchValue(StatusDone),
	})
	if err != nil {
		t.Fatalf("expected update v2 to succeed, got error: %v", err)
	}

	if len(store.updateParams) != 1 {
		t.Fatalf("expected update v2 to call the store once, got %#v", store.updateParams)
	}
	params := store.updateParams[0]
	if !params.CompletedAt.HasValue() {
		t.Fatal("expected completedAt to be populated when status enters done")
	}
	if params.CompletedAt.Value.IsZero() {
		t.Fatal("expected completedAt to be a real timestamp")
	}
	if !params.Status.HasValue() || params.Status.Value != StatusDone {
		t.Fatalf("expected done status to be persisted, got %#v", params.Status)
	}
}

func TestServiceUpdateV2IgnoresCallerSuppliedCompletedAt(t *testing.T) {
	store := &captureTodoStore{}
	svc := NewService(store)
	suppliedCompletedAt := time.Date(2026, 4, 2, 17, 0, 0, 0, time.UTC)

	_, err := svc.UpdateV2(context.Background(), "owner-123", "todo-1", UpdateParams{
		Title:       NewPatchValue("Finish release"),
		Status:      NewPatchValue(StatusDone),
		CompletedAt: NewPatchValue(suppliedCompletedAt),
	})
	if err != nil {
		t.Fatalf("expected update v2 to succeed, got error: %v", err)
	}
	if len(store.updateParams) != 1 {
		t.Fatalf("expected update v2 to call the store once, got %#v", store.updateParams)
	}
	params := store.updateParams[0]
	if !params.CompletedAt.HasValue() {
		t.Fatal("expected server-managed completedAt to be populated")
	}
	if params.CompletedAt.Value.Equal(suppliedCompletedAt) {
		t.Fatalf("expected caller completedAt to be ignored, got %#v", params.CompletedAt)
	}
}

func TestServiceUpdateV2ArchivesTask(t *testing.T) {
	store := &captureTodoStore{}
	svc := NewService(store)
	archivedAt := time.Date(2026, 4, 2, 18, 30, 0, 0, time.UTC)

	_, err := svc.UpdateV2(context.Background(), "owner-123", "todo-1", UpdateParams{
		Title:      NewPatchValue("Draft spec"),
		ArchivedAt: NewPatchValue(archivedAt),
	})
	if err != nil {
		t.Fatalf("expected update v2 to succeed, got error: %v", err)
	}

	if len(store.updateParams) != 1 {
		t.Fatalf("expected update v2 to call the store once, got %#v", store.updateParams)
	}
	params := store.updateParams[0]
	if !params.ArchivedAt.HasValue() {
		t.Fatal("expected archivedAt to be forwarded")
	}
	if !params.ArchivedAt.Value.Equal(archivedAt) {
		t.Fatalf("expected archivedAt %v, got %v", archivedAt, params.ArchivedAt.Value)
	}
	if params.CompletedAt.Present {
		t.Fatalf("expected archived update not to touch completedAt, got %#v", params.CompletedAt)
	}
}

func TestServiceNormalizeCreateParamsDefaultsAndTags(t *testing.T) {
	svc := &Service{}
	params := &CreateParams{
		Title: "  Write docs  ",
		Tags: []string{
			" Work ",
			"work",
			"FOCUS",
			" focus ",
			"",
			" review ",
		},
	}

	if err := svc.NormalizeCreateParams(params); err != nil {
		t.Fatalf("expected create params to normalize, got error: %v", err)
	}

	if got, want := params.Title, "Write docs"; got != want {
		t.Fatalf("expected trimmed title %q, got %q", want, got)
	}
	if got, want := params.Status, StatusTodo; got != want {
		t.Fatalf("expected default status %q, got %q", want, got)
	}
	if got, want := params.Priority, PriorityMedium; got != want {
		t.Fatalf("expected default priority %q, got %q", want, got)
	}
	if params.CompletedAt != nil {
		t.Fatalf("expected completedAt to stay nil for todo status, got %v", params.CompletedAt)
	}

	wantTags := []string{"work", "focus", "review"}
	if !reflect.DeepEqual(params.Tags, wantTags) {
		t.Fatalf("expected normalized tags %v, got %v", wantTags, params.Tags)
	}
}

func TestServiceNormalizeCreateParamsSetsCompletedAtWhenDone(t *testing.T) {
	svc := &Service{}
	suppliedCompletedAt := time.Date(2026, 4, 2, 11, 0, 0, 0, time.UTC)
	params := &CreateParams{
		Title:       "Finish release",
		Status:      StatusDone,
		CompletedAt: &suppliedCompletedAt,
	}

	if err := svc.NormalizeCreateParams(params); err != nil {
		t.Fatalf("expected done create params to normalize, got error: %v", err)
	}

	if got, want := params.Status, StatusDone; got != want {
		t.Fatalf("expected status %q, got %q", want, got)
	}
	if got, want := params.Priority, PriorityMedium; got != want {
		t.Fatalf("expected default priority %q, got %q", want, got)
	}
	if params.CompletedAt == nil {
		t.Fatal("expected completedAt to be set when status is done")
	}
	if params.CompletedAt.Equal(suppliedCompletedAt) {
		t.Fatalf("expected caller completedAt to be overwritten, got %#v", params.CompletedAt)
	}
}

func TestServiceNormalizeCreateParamsRejectsBlankTitle(t *testing.T) {
	svc := &Service{}
	params := &CreateParams{
		Title: "   ",
	}

	err := svc.NormalizeCreateParams(params)
	if !errors.Is(err, ErrInvalidTitle) {
		t.Fatalf("expected invalid title error, got %v", err)
	}
}

func TestServiceNormalizeCreateParamsRejectsInvalidEnums(t *testing.T) {
	svc := &Service{}
	params := &CreateParams{
		Title:    "Valid title",
		Status:   Status("bogus"),
		Priority: Priority("urgent"),
	}

	err := svc.NormalizeCreateParams(params)
	if !errors.Is(err, ErrInvalidStatus) {
		t.Fatalf("expected invalid status error, got %v", err)
	}
}

func TestServiceNormalizeCreateParamsRejectsInvalidPriority(t *testing.T) {
	svc := &Service{}
	params := &CreateParams{
		Title:    "Valid title",
		Status:   StatusTodo,
		Priority: Priority("urgent"),
	}

	err := svc.NormalizeCreateParams(params)
	if !errors.Is(err, ErrInvalidPriority) {
		t.Fatalf("expected invalid priority error, got %v", err)
	}
}

func TestServiceNormalizeUpdateParamsClearsCompletedAtWhenLeavingDone(t *testing.T) {
	svc := &Service{}
	completedAt := time.Date(2026, 4, 2, 12, 0, 0, 0, time.UTC)
	params := &UpdateParams{
		Title:       NewPatchValue("In progress"),
		Status:      NewPatchValue(StatusInProgress),
		CompletedAt: NewPatchValue(completedAt),
	}

	if err := svc.NormalizeUpdateParams(params); err != nil {
		t.Fatalf("expected update params to normalize, got error: %v", err)
	}

	if !params.CompletedAt.IsNull() {
		t.Fatalf("expected completedAt to be cleared when status leaves done, got %#v", params.CompletedAt)
	}
}

func TestServiceNormalizeUpdateParamsIgnoresCompletedAtWithoutStatus(t *testing.T) {
	svc := &Service{}
	completedAt := time.Date(2026, 4, 2, 13, 0, 0, 0, time.UTC)
	params := &UpdateParams{
		Title:       NewPatchValue("  In progress  "),
		CompletedAt: NewPatchValue(completedAt),
	}

	if err := svc.NormalizeUpdateParams(params); err != nil {
		t.Fatalf("expected update params to normalize, got error: %v", err)
	}

	if !params.Title.HasValue() || params.Title.Value != "In progress" {
		t.Fatalf("expected trimmed title %q, got %#v", "In progress", params.Title)
	}
	if params.Status.Present {
		t.Fatalf("expected omitted status to stay untouched, got %#v", params.Status)
	}
	if params.Priority.Present {
		t.Fatalf("expected omitted priority to stay untouched, got %#v", params.Priority)
	}
	if !params.CompletedAt.IsNull() {
		t.Fatalf("expected completedAt to be ignored without status, got %#v", params.CompletedAt)
	}
}

func TestServiceNormalizeUpdateParamsRejectsBlankTitle(t *testing.T) {
	svc := &Service{}
	params := &UpdateParams{
		Title: NewPatchValue("   "),
	}

	err := svc.NormalizeUpdateParams(params)
	if !errors.Is(err, ErrInvalidTitle) {
		t.Fatalf("expected invalid title error, got %v", err)
	}
}

func TestServiceNormalizeUpdateParamsRejectsInvalidPriority(t *testing.T) {
	svc := &Service{}
	priority := Priority("urgent")
	params := &UpdateParams{
		Title:    NewPatchValue("Still valid"),
		Priority: NewPatchValue(priority),
	}

	err := svc.NormalizeUpdateParams(params)
	if !errors.Is(err, ErrInvalidPriority) {
		t.Fatalf("expected invalid priority error, got %v", err)
	}
}

func TestServiceNormalizeUpdateParamsRejectsInvalidEnums(t *testing.T) {
	svc := &Service{}
	status := Status("bogus")
	priority := Priority("urgent")
	params := &UpdateParams{
		Title:    NewPatchValue("Still valid"),
		Status:   NewPatchValue(status),
		Priority: NewPatchValue(priority),
	}

	err := svc.NormalizeUpdateParams(params)
	if !errors.Is(err, ErrInvalidStatus) {
		t.Fatalf("expected invalid status error, got %v", err)
	}
}

func TestServiceNormalizeUpdateParamsOverwritesSuppliedCompletedAtWhenDone(t *testing.T) {
	svc := &Service{}
	completedAt := time.Date(2026, 4, 2, 14, 0, 0, 0, time.UTC)
	params := &UpdateParams{
		Title:       NewPatchValue("Finish release"),
		Status:      NewPatchValue(StatusDone),
		CompletedAt: NewPatchValue(completedAt),
	}

	if err := svc.NormalizeUpdateParams(params); err != nil {
		t.Fatalf("expected update params to normalize, got error: %v", err)
	}

	if !params.CompletedAt.HasValue() {
		t.Fatalf("expected completedAt to stay set when status is done, got %#v", params.CompletedAt)
	}
	if params.CompletedAt.Value.Equal(completedAt) {
		t.Fatalf("expected supplied completedAt %v to be overwritten, got %v", completedAt, params.CompletedAt.Value)
	}
}

func TestServiceNormalizeUpdateParamsAutoSetsCompletedAtWhenEnteringDone(t *testing.T) {
	svc := &Service{}
	params := &UpdateParams{
		Title:  NewPatchValue("Finish release"),
		Status: NewPatchValue(StatusDone),
	}

	if err := svc.NormalizeUpdateParams(params); err != nil {
		t.Fatalf("expected update params to normalize, got error: %v", err)
	}

	if !params.CompletedAt.HasValue() {
		t.Fatalf("expected completedAt to be set when entering done, got %#v", params.CompletedAt)
	}
	if params.CompletedAt.Value.IsZero() {
		t.Fatal("expected completedAt to be auto-populated with a timestamp")
	}
}

func TestServiceNormalizeUpdateParamsNormalizesTags(t *testing.T) {
	svc := &Service{}
	tags := []string{" Work ", "work", "FOCUS", "", " review "}
	params := &UpdateParams{
		Title: NewPatchValue("Wire tags"),
		Tags:  NewPatchValue(tags),
	}

	if err := svc.NormalizeUpdateParams(params); err != nil {
		t.Fatalf("expected update params to normalize, got error: %v", err)
	}

	if !params.Tags.HasValue() {
		t.Fatalf("expected tags to remain set, got %#v", params.Tags)
	}
	wantTags := []string{"work", "focus", "review"}
	if !reflect.DeepEqual(params.Tags.Value, wantTags) {
		t.Fatalf("expected normalized tags %v, got %v", wantTags, params.Tags.Value)
	}
}

func TestUpdateParamsMarshalJSONUsesRealValues(t *testing.T) {
	params := UpdateParams{
		Title:       NewPatchValue("Wire JSON"),
		Status:      NewPatchNull[Status](),
		Priority:    PatchField[Priority]{},
		CompletedAt: NewPatchNull[time.Time](),
		Tags:        NewPatchValue([]string{"work", "focus"}),
	}

	data, err := json.Marshal(params)
	if err != nil {
		t.Fatalf("expected update params to marshal, got error: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(data, &got); err != nil {
		t.Fatalf("expected marshaled JSON to decode, got error: %v", err)
	}

	if _, ok := got["priority"]; ok {
		t.Fatalf("expected omitted priority to disappear from marshaled JSON, got %#v", got)
	}
	if _, ok := got["descriptionHtml"]; ok {
		t.Fatalf("expected omitted descriptionHtml to disappear from marshaled JSON, got %#v", got)
	}
	if _, ok := got["dueAt"]; ok {
		t.Fatalf("expected omitted dueAt to disappear from marshaled JSON, got %#v", got)
	}
	if _, ok := got["archivedAt"]; ok {
		t.Fatalf("expected omitted archivedAt to disappear from marshaled JSON, got %#v", got)
	}
	if got["title"] != "Wire JSON" {
		t.Fatalf("expected title to marshal as a normal value, got %#v", got["title"])
	}
	if got["status"] != nil {
		t.Fatalf("expected explicit clear status to marshal as null, got %#v", got["status"])
	}
	if got["completedAt"] != nil {
		t.Fatalf("expected explicit clear completedAt to marshal as null, got %#v", got["completedAt"])
	}
	if tags, ok := got["tags"].([]any); !ok || len(tags) != 2 || tags[0] != "work" || tags[1] != "focus" {
		t.Fatalf("expected tags to marshal as normal values, got %#v", got["tags"])
	}
}

type captureTodoStore struct {
	listItems    []Item
	listOpts     []ListOptions
	createParams []CreateParams
	updateParams []UpdateParams
	deleteCalls  []string
}

func (s *captureTodoStore) List(_ context.Context, _ string) ([]Item, error) {
	return append([]Item(nil), s.listItems...), nil
}

func (s *captureTodoStore) ListWithOptions(_ context.Context, _ string, opts ListOptions) ([]Item, error) {
	s.listOpts = append(s.listOpts, opts)
	return append([]Item(nil), s.listItems...), nil
}

func (s *captureTodoStore) Create(_ context.Context, _ string, title string) (Item, error) {
	return Item{Title: title}, nil
}

func (s *captureTodoStore) CreateV2(_ context.Context, _ string, params CreateParams) (Item, error) {
	s.createParams = append(s.createParams, params)
	return Item{
		Title:           params.Title,
		DescriptionHtml: params.DescriptionHtml,
		Status:          params.Status,
		Priority:        params.Priority,
		DueAt:           params.DueAt,
		Tags:            append([]string(nil), params.Tags...),
		CompletedAt:     params.CompletedAt,
		ArchivedAt:      params.ArchivedAt,
	}, nil
}

func (s *captureTodoStore) Update(_ context.Context, _ string, _ string, _ *string, _ *bool) (Item, error) {
	return Item{}, nil
}

func (s *captureTodoStore) UpdateV2(_ context.Context, _ string, _ string, params UpdateParams) (Item, error) {
	s.updateParams = append(s.updateParams, params)
	return Item{
		Title:           valueOrEmpty(params.Title),
		DescriptionHtml: fieldValueOrEmpty(params.DescriptionHtml),
		Status:          fieldValueOrStatus(params.Status),
		Priority:        fieldValueOrPriority(params.Priority),
		DueAt:           fieldValueOrTimePtr(params.DueAt),
		Tags:            fieldValueOrTags(params.Tags),
		CompletedAt:     fieldValueOrTimePtr(params.CompletedAt),
		ArchivedAt:      fieldValueOrTimePtr(params.ArchivedAt),
	}, nil
}

func (s *captureTodoStore) Delete(_ context.Context, _ string, todoID string) error {
	s.deleteCalls = append(s.deleteCalls, todoID)
	return nil
}

func valueOrEmpty(field PatchField[string]) string {
	if field.HasValue() {
		return field.Value
	}
	return ""
}

func fieldValueOrEmpty(field PatchField[string]) string {
	if field.HasValue() {
		return field.Value
	}
	return ""
}

func fieldValueOrStatus(field PatchField[Status]) Status {
	if field.HasValue() {
		return field.Value
	}
	return ""
}

func fieldValueOrPriority(field PatchField[Priority]) Priority {
	if field.HasValue() {
		return field.Value
	}
	return ""
}

func fieldValueOrTimePtr(field PatchField[time.Time]) *time.Time {
	if field.HasValue() {
		value := field.Value.UTC()
		return &value
	}
	return nil
}

func fieldValueOrTags(field PatchField[[]string]) []string {
	if field.HasValue() {
		return append([]string(nil), field.Value...)
	}
	return nil
}
