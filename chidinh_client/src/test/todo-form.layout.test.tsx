import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TodoForm } from "../modules/todo/TodoForm";
import type { TaskFormState } from "../modules/todo/todoFormState";

const baseFormState: TaskFormState = {
  title: "",
  descriptionHtml: "",
  status: "todo",
  priority: "medium",
  dueOn: "",
  tags: [],
};

describe("TodoForm two-column eligibility", () => {
  test("falls back to a single column for title and due date when the row fails the spec checklist", () => {
    const { container } = render(
      <TodoForm
        descriptionEditorRef={{ current: null }}
        editingTaskId={null}
        formError={null}
        formState={baseFormState}
        isDueDateVisible
        isSubmitting={false}
        tagInput=""
        tagSuggestions={[]}
        titleError={null}
        validationErrors={[]}
        onCancelEdit={() => {}}
        onDescriptionCommand={() => {}}
        onDescriptionInput={() => {}}
        onDueOnChange={() => {}}
        onPriorityChange={() => {}}
        onPushTags={() => {}}
        onRemoveTag={() => {}}
        onStatusChange={() => {}}
        onSubmit={(event) => event.preventDefault()}
        onTagInputChange={() => {}}
        onTitleChange={() => {}}
      />,
    );

    const rows = container.querySelectorAll('[data-slot="field-row"]');

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("data-columns", "1");
    expect(rows[0]).not.toHaveClass("md:grid-cols-2");
    expect(rows[1]).toHaveAttribute("data-columns", "2");
    expect(rows[1]).toHaveClass("md:grid-cols-2");
  });
});
