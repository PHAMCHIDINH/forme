import type { MutableRefObject } from "react";

import { Panel } from "../../shared/ui/Panel";
import { TaskPriority, TaskStatus } from "./taskTypes";
import { TaskFormState } from "./todoFormState";

type TodoFormProps = {
  formState: TaskFormState;
  tagInput: string;
  tagSuggestions: string[];
  formError: string | null;
  editingTaskId: string | null;
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
  formError,
  editingTaskId,
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
  return (
    <Panel className="p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="todo-title">Task Title</label>
            <input
              id="todo-title"
              placeholder="Add a new task"
              value={formState.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="todo-due">Due date</label>
            <input
              id="todo-due"
              type="date"
              value={formState.dueOn}
              onChange={(event) => onDueOnChange(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="todo-status">Status</label>
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
            <label htmlFor="todo-priority">Priority</label>
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
        </div>

        <div className="space-y-2">
          <label htmlFor="todo-tags">Tags</label>
          <input
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
            <button
              type="button"
              className="rounded border border-border px-3 py-1 text-xs"
              onClick={() => onDescriptionCommand("bold")}
            >
              B
            </button>
            <button
              type="button"
              className="rounded border border-border px-3 py-1 text-xs"
              onClick={() => onDescriptionCommand("italic")}
            >
              I
            </button>
            <button
              type="button"
              className="rounded border border-border px-3 py-1 text-xs"
              onClick={() => onDescriptionCommand("insertUnorderedList")}
            >
              UL
            </button>
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

        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {editingTaskId ? (isSubmitting ? "Saving..." : "Save Task") : isSubmitting ? "Adding..." : "Add Task"}
          </button>
          {editingTaskId ? (
            <button
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 text-sm text-text transition hover:bg-surfaceAlt"
              type="button"
              onClick={onCancelEdit}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
