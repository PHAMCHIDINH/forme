package todo

import (
	"encoding/json"
	"errors"
	"reflect"
	"testing"
	"time"
)

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
	params := &CreateParams{
		Title:  "Finish release",
		Status: StatusDone,
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

func TestServiceNormalizeUpdateParamsLeavesOmittedStatusAndPriorityUntouched(t *testing.T) {
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
	if !params.CompletedAt.HasValue() || !params.CompletedAt.Value.Equal(completedAt) {
		t.Fatalf("expected completedAt to stay untouched, got %#v", params.CompletedAt)
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

func TestServiceNormalizeUpdateParamsPreservesSuppliedCompletedAtWhenDone(t *testing.T) {
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
	if !params.CompletedAt.Value.Equal(completedAt) {
		t.Fatalf("expected supplied completedAt %v, got %v", completedAt, params.CompletedAt.Value)
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
