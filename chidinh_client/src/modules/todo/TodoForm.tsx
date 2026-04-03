import type { MutableRefObject } from "react";

import {
  ActionArea,
  ConditionalFieldBlock,
  FieldRow,
  ValidationSummary,
  type ValidationSummaryError,
} from "../../shared/form-system/patterns";
import { ErrorText, Label } from "../../shared/form-system/primitives";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Panel } from "../../shared/ui/Panel";
import { TaskPriority, TaskStatus } from "./taskTypes";
import { TaskFormState } from "./todoFormState";

type TodoFormProps = {
  formState: TaskFormState;
  tagInput: string;
  tagSuggestions: string[];
  validationErrors: ValidationSummaryError[];
  titleError: string | null;
  formError: string | null;
  editingTaskId: string | null;
  isDueDateVisible: boolean;
  isSubmitting: boolean;
  descriptionEditorRef: MutableRefObject<HTMLDivElement | null>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
  onDueOnChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
  onPriorityChange: (value: TaskPriority) => void;
  onTagInputChange: (value: string) => void;
  onPushTags: (rawValue: string) => void;
  onRemoveTag: (tag: string) => void;
  onDescriptionCommand: (command: "bold" | "italic" | "insertUnorderedList") => void;
  onDescriptionInput: (html: string) => void;
  onCancelEdit: () => void;
};

export function TodoForm({
  formState,
  tagInput,
  tagSuggestions,
  validationErrors,
  titleError,
  formError,
  editingTaskId,
  isDueDateVisible,
  isSubmitting,
  descriptionEditorRef,
  onSubmit,
  onTitleChange,
  onDueOnChange,
  onStatusChange,
  onPriorityChange,
  onTagInputChange,
  onPushTags,
  onRemoveTag,
  onDescriptionCommand,
  onDescriptionInput,
  onCancelEdit,
}: TodoFormProps) {
  const titleErrorId = "todo-title-error";

  return (
    <Panel className="p-6">
      <form className="space-y-5" noValidate onSubmit={onSubmit}>
        <ValidationSummary errors={validationErrors} />

        <FieldRow columns={2}>
          <div className="space-y-2">
            <Label htmlFor="todo-title">Task Title</Label>
            <Input
              id="todo-title"
              aria-describedby={titleError ? titleErrorId : undefined}
              aria-invalid={titleError ? "true" : undefined}
              placeholder="Add a new task"
              value={formState.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
            {titleError ? <ErrorText id={titleErrorId}>{titleError}</ErrorText> : null}
          </div>
          <ConditionalFieldBlock visible={isDueDateVisible} className="space-y-2">
            <Label htmlFor="todo-due">Due date</Label>
            <Input
              id="todo-due"
              type="date"
              value={formState.dueOn}
              onChange={(event) => onDueOnChange(event.target.value)}
            />
          </ConditionalFieldBlock>
        </FieldRow>

        <FieldRow columns={2}>
          <div className="space-y-2">
            <Label htmlFor="todo-status">Status</Label>
            <select
              id="todo-status"
              value={formState.status}
              onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-priority">Priority</Label>
            <select
              id="todo-priority"
              value={formState.priority}
              onChange={(event) => onPriorityChange(event.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </FieldRow>

        <div className="space-y-2">
          <Label htmlFor="todo-tags">Tags</Label>
          <Input
            id="todo-tags"
            value={tagInput}
            placeholder="Type tag and press Enter or comma"
            onChange={(event) => onTagInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                onPushTags(tagInput);
                onTagInputChange("");
              }
            }}
            onBlur={() => {
              onPushTags(tagInput);
              onTagInputChange("");
            }}
          />
          <div className="flex flex-wrap gap-2">
            {tagSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:bg-surfaceAlt"
                onClick={() => onPushTags(tag)}
              >
                + #{tag}
              </button>
            ))}
          </div>
          {formState.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formState.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="rounded-full bg-surfaceAlt px-3 py-1 text-xs text-text"
                  onClick={() => onRemoveTag(tag)}
                >
                  #{tag} x
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted">Description (rich text nhe)</p>
          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Bold"
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onDescriptionCommand("bold")}
            >
              B
            </Button>
            <Button
              aria-label="Italic"
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onDescriptionCommand("italic")}
            >
              I
            </Button>
            <Button
              aria-label="Bulleted list"
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onDescriptionCommand("insertUnorderedList")}
            >
              UL
            </Button>
          </div>
          <div
            ref={descriptionEditorRef}
            role="textbox"
            aria-label="Task description"
            contentEditable
            className="min-h-24 rounded border border-border bg-surface px-3 py-2 text-sm text-text"
            onInput={(event) => onDescriptionInput(event.currentTarget.innerHTML)}
          />
        </div>

        {formError ? <ErrorText>{formError}</ErrorText> : null}

        <ActionArea
          primary={
            <Button type="submit" disabled={isSubmitting} pending={isSubmitting}>
              {editingTaskId ? (isSubmitting ? "Saving..." : "Save Task") : isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          }
          secondary={
            editingTaskId ? (
              <Button type="button" variant="secondary" onClick={onCancelEdit}>
                Cancel Edit
              </Button>
            ) : null
          }
        />
      </form>
    </Panel>
  );
}
