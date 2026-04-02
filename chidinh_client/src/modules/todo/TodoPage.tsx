import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";
import { TAG_SUGGESTIONS } from "./tagSuggestions";
import { CreateTaskInput, TaskItem, TaskListView, TaskPriority, TaskStatus, UpdateTaskInput } from "./taskTypes";

type LayoutMode = "list" | "board";

type TaskFormState = {
  title: string;
  descriptionHtml: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueOn: string;
  tags: string[];
};

const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

const DEFAULT_FORM_STATE: TaskFormState = {
  title: "",
  descriptionHtml: "",
  status: "todo",
  priority: "medium",
  dueOn: "",
  tags: [],
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

function parseTagInput(value: string) {
  return value
    .split(",")
    .map((part) => normalizeTag(part))
    .filter(Boolean);
}

function addUniqueTags(existing: string[], next: string[]) {
  const seen = new Set(existing);
  const merged = [...existing];
  for (const tag of next) {
    if (seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    merged.push(tag);
  }
  return merged;
}

function formatDateInputInAppZone(iso: string | null) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function dateInputToIsoInAppZone(value: string) {
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return undefined;
  }

  const utcMs = Date.UTC(year, month - 1, day, -7, 0, 0, 0);
  return new Date(utcMs).toISOString();
}

function formatDueAt(iso: string | null) {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatter.format(date);
}

function sanitizeRichText(html: string) {
  const withoutScripts = html
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script>/gi, "")
    .replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style>/gi, "");

  return withoutScripts.replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (match, rawTag) => {
    const tag = String(rawTag).toLowerCase();
    const allowed = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li"]);
    if (!allowed.has(tag)) {
      return "";
    }
    return match.startsWith("</") ? `</${tag}>` : `<${tag}>`;
  });
}

function toFormState(item: TaskItem): TaskFormState {
  return {
    title: item.title,
    descriptionHtml: item.descriptionHtml ?? "",
    status: item.status,
    priority: item.priority,
    dueOn: formatDateInputInAppZone(item.dueAt),
    tags: item.tags ?? [],
  };
}

export function TodoPage() {
  const queryClient = useQueryClient();
  const descriptionEditorRef = useRef<HTMLDivElement | null>(null);

  const [view, setView] = useState<TaskListView>("active");
  const [layout, setLayout] = useState<LayoutMode>("list");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<TaskFormState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const editor = descriptionEditorRef.current;
    if (!editor) {
      return;
    }
    if (editor.innerHTML !== formState.descriptionHtml) {
      editor.innerHTML = formState.descriptionHtml;
    }
  }, [formState.descriptionHtml]);

  const todosQuery = useQuery({
    queryKey: ["todos", view, search],
    queryFn: () => listTodos({ view, q: search || undefined }),
  });

  const items = todosQuery.data?.items ?? [];

  const metrics = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.status === "done" && item.archivedAt == null).length;

    return {
      total,
      completed,
      open: total - completed,
    };
  }, [items]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskInput) => createTodo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskInput }) => updateTodo(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const boardGroups = useMemo(
    () => ({
      todo: items.filter((item) => item.status === "todo"),
      in_progress: items.filter((item) => item.status === "in_progress"),
      done: items.filter((item) => item.status === "done"),
      cancelled: items.filter((item) => item.status === "cancelled"),
    }),
    [items],
  );

  const clearForm = () => {
    setFormState(DEFAULT_FORM_STATE);
    setTagInput("");
    setFormError(null);
    setEditingTaskId(null);
  };

  const runDescriptionCommand = (command: "bold" | "italic" | "insertUnorderedList") => {
    descriptionEditorRef.current?.focus();
    document.execCommand(command);
    const next = sanitizeRichText(descriptionEditorRef.current?.innerHTML ?? "");
    setFormState((current) => ({ ...current, descriptionHtml: next }));
  };

  const pushTags = (rawValue: string) => {
    const parsed = parseTagInput(rawValue);
    if (parsed.length === 0) {
      return;
    }

    setFormState((current) => ({
      ...current,
      tags: addUniqueTags(current.tags, parsed),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = formState.title.trim();

    if (!title) {
      setFormError("Task title is required");
      return;
    }

    const payload: CreateTaskInput = {
      title,
      descriptionHtml: formState.descriptionHtml ? sanitizeRichText(formState.descriptionHtml) : undefined,
      status: formState.status,
      priority: formState.priority,
      dueAt: formState.dueOn ? dateInputToIsoInAppZone(formState.dueOn) : undefined,
      tags: formState.tags,
    };

    try {
      if (editingTaskId) {
        await updateMutation.mutateAsync({
          id: editingTaskId,
          payload: {
            ...payload,
            dueAt: payload.dueAt ?? null,
            tags: payload.tags ?? [],
          },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      clearForm();
    } catch (error) {
      setFormError("Failed to save task");
    }
  };

  const setEditingTask = (item: TaskItem) => {
    setEditingTaskId(item.id);
    setFormState(toFormState(item));
    setTagInput("");
    setFormError(null);
  };

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Operations"
        title="Personal Tasks"
        description="Track active execution tasks inside the private workspace."
      />

      <Panel className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="todo-view">View</label>
            <select
              id="todo-view"
              value={view}
              onChange={(event) => setView(event.target.value as TaskListView)}
            >
              <option value="active">All active</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="todo-search">Search</label>
            <input
              id="todo-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search title, description, tags"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="todo-layout">Layout</label>
            <select
              id="todo-layout"
              value={layout}
              onChange={(event) => setLayout(event.target.value as LayoutMode)}
            >
              <option value="list">List</option>
              <option value="board">Board</option>
            </select>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <p className="text-sm text-muted">Tasks</p>
          <p className="mt-3 text-xl font-display text-text">{metrics.total} total</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-muted">Open</p>
          <p className="mt-3 text-xl font-display text-text">{metrics.open} open</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-muted">Completed</p>
          <p className="mt-3 text-xl font-display text-text">{metrics.completed} complete</p>
        </Panel>
      </div>

      <Panel className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
            <label htmlFor="todo-title">Task Title</label>
            <input
              id="todo-title"
              placeholder="Add a new task"
              value={formState.title}
              onChange={(event) => {
                setFormState((current) => ({ ...current, title: event.target.value }));
                if (formError) {
                  setFormError(null);
                }
              }}
            />
            </div>
            <div className="space-y-2">
              <label htmlFor="todo-due">Due date</label>
              <input
                id="todo-due"
                type="date"
                value={formState.dueOn}
                onChange={(event) => setFormState((current) => ({ ...current, dueOn: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="todo-status">Status</label>
              <select
                id="todo-status"
                value={formState.status}
                onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as TaskStatus }))}
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
                onChange={(event) =>
                  setFormState((current) => ({ ...current, priority: event.target.value as TaskPriority }))
                }
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
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  pushTags(tagInput);
                  setTagInput("");
                }
              }}
              onBlur={() => {
                pushTags(tagInput);
                setTagInput("");
              }}
            />
            <div className="flex flex-wrap gap-2">
              {TAG_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:bg-surfaceAlt"
                  onClick={() => pushTags(tag)}
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
                    onClick={() =>
                      setFormState((current) => ({
                        ...current,
                        tags: current.tags.filter((currentTag) => currentTag !== tag),
                      }))
                    }
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted">Description (rich text nhẹ)</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-xs"
                onClick={() => runDescriptionCommand("bold")}
              >
                B
              </button>
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-xs"
                onClick={() => runDescriptionCommand("italic")}
              >
                I
              </button>
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-xs"
                onClick={() => runDescriptionCommand("insertUnorderedList")}
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
              onInput={(event) => {
                const value = sanitizeRichText(event.currentTarget.innerHTML);
                setFormState((current) => ({ ...current, descriptionHtml: value }));
              }}
            />
          </div>

          {formError ? <p className="text-sm text-red-700">{formError}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTaskId ? (updateMutation.isPending ? "Saving..." : "Save Task") : createMutation.isPending ? "Adding..." : "Add Task"}
            </button>
            {editingTaskId ? (
              <button
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 text-sm text-text transition hover:bg-surfaceAlt"
                type="button"
                onClick={clearForm}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </Panel>

      {todosQuery.isLoading ? (
        <Panel className="p-6">
          <p>Loading todos...</p>
        </Panel>
      ) : null}

      {todosQuery.isError ? (
        <Panel className="p-6">
          <p>Failed to load todos.</p>
        </Panel>
      ) : null}

      {!todosQuery.isLoading && !todosQuery.isError && items.length === 0 ? (
        <Panel className="p-8 text-center">
          <p className="font-display text-2xl text-text">No tasks in this view yet.</p>
          <p className="mt-2 text-sm text-muted">
            Add your first item to start shaping the workspace rhythm.
          </p>
        </Panel>
      ) : null}

      {items.length > 0 && layout === "list" ? (
        <div className="space-y-3">
          {items.map((todo) => (
            <Panel className="space-y-3 p-5" key={todo.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text">{todo.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {todo.status} · {todo.priority}
                    {todo.dueAt ? ` · due ${formatDueAt(todo.dueAt)}` : ""}
                    {todo.tags.length > 0 ? ` · #${todo.tags.join(" #")}` : ""}
                  </p>
                </div>
                <select
                  aria-label={`Status for ${todo.title}`}
                  value={todo.status}
                  onChange={(event) =>
                    updateMutation.mutate({
                      id: todo.id,
                      payload: { status: event.target.value as TaskStatus },
                    })
                  }
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {todo.descriptionHtml ? (
                <div
                  className="text-sm text-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(todo.descriptionHtml) }}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
                  type="button"
                  onClick={() => setEditingTask(todo)}
                >
                  Edit
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
                  type="button"
                  onClick={() =>
                    updateMutation.mutate({
                      id: todo.id,
                      payload: { archivedAt: todo.archivedAt ? null : new Date().toISOString() },
                    })
                  }
                >
                  {todo.archivedAt ? "Unarchive" : "Archive"}
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
                  type="button"
                  onClick={() => deleteMutation.mutate(todo.id)}
                >
                  Delete
                </button>
              </div>
            </Panel>
          ))}
        </div>
      ) : null}

      {items.length > 0 && layout === "board" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(boardGroups) as TaskStatus[]).map((status) => (
            <Panel className="p-4" key={status}>
              <p className="text-sm font-medium text-text">
                {STATUS_LABELS[status]} ({boardGroups[status].length})
              </p>
              <div className="mt-3 space-y-3">
                {boardGroups[status].map((todo) => (
                  <div className="rounded border border-border bg-surface p-3" key={todo.id}>
                    <p className="text-sm font-medium text-text">{todo.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {todo.priority}
                      {todo.dueAt ? ` · due ${formatDueAt(todo.dueAt)}` : ""}
                    </p>
                    {todo.tags.length > 0 ? (
                      <p className="mt-1 text-xs text-muted">#{todo.tags.join(" #")}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <select
                        aria-label={`Board status for ${todo.title}`}
                        value={todo.status}
                        onChange={(event) =>
                          updateMutation.mutate({
                            id: todo.id,
                            payload: { status: event.target.value as TaskStatus },
                          })
                        }
                      >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        className="rounded border border-border px-2 py-1 text-xs"
                        type="button"
                        onClick={() => setEditingTask(todo)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded border border-border px-2 py-1 text-xs"
                        type="button"
                        onClick={() =>
                          updateMutation.mutate({
                            id: todo.id,
                            payload: { archivedAt: todo.archivedAt ? null : new Date().toISOString() },
                          })
                        }
                      >
                        {todo.archivedAt ? "Unarchive" : "Archive"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      ) : null}
    </section>
  );
}
