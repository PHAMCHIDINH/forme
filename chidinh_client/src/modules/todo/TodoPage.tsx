import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { reconcileDependentFieldState } from "../../shared/form-system/contracts/dependentFieldState";
import type { ValidationSummaryError } from "../../shared/form-system/patterns";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";
import { TodoBoard } from "./TodoBoard";
import { TodoForm } from "./TodoForm";
import { TaskFormState, DEFAULT_FORM_STATE } from "./todoFormState";
import { TodoList } from "./TodoList";
import { TodoMetrics } from "./TodoMetrics";
import { LayoutMode, TodoToolbar } from "./TodoToolbar";
import { TAG_SUGGESTIONS } from "./tagSuggestions";
import { CreateTaskInput, TaskItem, TaskListView, TaskPriority, TaskStatus, UpdateTaskInput } from "./taskTypes";
import { dateInputToIsoInAppZone, formatDateInputInAppZone, formatDueAt } from "./todoDate";
import { addUniqueTags, parseTagInput } from "./todoTags";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

type TodoFieldErrors = {
  title: string | null;
};

const DEFAULT_FIELD_ERRORS: TodoFieldErrors = {
  title: null,
};

function isDueDateVisible(status: TaskStatus) {
  return status === "todo" || status === "in_progress";
}

function reconcileTodoFormState(state: TaskFormState): TaskFormState {
  const dueDateState = reconcileDependentFieldState({
    visible: isDueDateVisible(state.status),
    value: state.dueOn || null,
    error: null,
    touched: false,
  });

  if (dueDateState.value === (state.dueOn || null)) {
    return state;
  }

  return {
    ...state,
    dueOn: dueDateState.value ?? "",
  };
}

function buildQuickStatusUpdatePayload(status: TaskStatus): UpdateTaskInput {
  return isDueDateVisible(status)
    ? { status }
    : {
        status,
        dueAt: null,
      };
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
  const [fieldErrors, setFieldErrors] = useState<TodoFieldErrors>(DEFAULT_FIELD_ERRORS);
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
    setFieldErrors(DEFAULT_FIELD_ERRORS);
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

  const validationErrors = useMemo(() => {
    const errors: ValidationSummaryError[] = [];

    if (fieldErrors.title) {
      errors.push({
        fieldId: "todo-title",
        message: fieldErrors.title,
      });
    }

    return errors;
  }, [fieldErrors.title]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = formState.title.trim();

    if (fieldErrors.title || formError) {
      setFieldErrors(DEFAULT_FIELD_ERRORS);
      setFormError(null);
    }

    if (!title) {
      setFieldErrors({
        title: "Task title is required",
      });
      return;
    }

    const payload: CreateTaskInput = {
      title,
      descriptionHtml: formState.descriptionHtml ? sanitizeRichText(formState.descriptionHtml) : undefined,
      status: formState.status,
      priority: formState.priority,
      dueAt:
        isDueDateVisible(formState.status) && formState.dueOn
          ? dateInputToIsoInAppZone(formState.dueOn)
          : undefined,
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
    setFormState(reconcileTodoFormState(toFormState(item)));
    setFieldErrors(DEFAULT_FIELD_ERRORS);
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

      <TodoToolbar
        view={view}
        searchInput={searchInput}
        layout={layout}
        onViewChange={setView}
        onSearchChange={setSearchInput}
        onLayoutChange={setLayout}
      />

      <TodoMetrics total={metrics.total} open={metrics.open} completed={metrics.completed} />

      <TodoForm
        formState={formState}
        tagInput={tagInput}
        tagSuggestions={TAG_SUGGESTIONS}
        validationErrors={validationErrors}
        titleError={fieldErrors.title}
        formError={formError}
        editingTaskId={editingTaskId}
        isDueDateVisible={isDueDateVisible(formState.status)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        descriptionEditorRef={descriptionEditorRef}
        onSubmit={handleSubmit}
        onTitleChange={(value) => {
          setFormState((current) => ({ ...current, title: value }));
          if (fieldErrors.title) {
            setFieldErrors((current) => ({ ...current, title: null }));
          }
          if (formError) {
            setFormError(null);
          }
        }}
        onDueOnChange={(value) => setFormState((current) => ({ ...current, dueOn: value }))}
        onStatusChange={(value) =>
          setFormState((current) =>
            reconcileTodoFormState({
              ...current,
              status: value,
            }),
          )
        }
        onPriorityChange={(value) => setFormState((current) => ({ ...current, priority: value }))}
        onTagInputChange={setTagInput}
        onPushTags={pushTags}
        onRemoveTag={(tag) =>
          setFormState((current) => ({
            ...current,
            tags: current.tags.filter((currentTag) => currentTag !== tag),
          }))
        }
        onDescriptionCommand={runDescriptionCommand}
        onDescriptionInput={(html) => {
          const value = sanitizeRichText(html);
          setFormState((current) => ({ ...current, descriptionHtml: value }));
        }}
        onCancelEdit={clearForm}
      />

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
        <Panel className="p-8">
          <EmptyState
            title="No tasks in this view yet."
            description="Add your first item to start shaping the workspace rhythm."
          />
        </Panel>
      ) : null}

      {items.length > 0 && layout === "list" ? (
        <TodoList
          items={items}
          formatDueAt={formatDueAt}
          sanitizeRichText={sanitizeRichText}
          onStatusChange={(id, status) => updateMutation.mutate({ id, payload: buildQuickStatusUpdatePayload(status) })}
          onEdit={setEditingTask}
          onToggleArchive={(todo) =>
            updateMutation.mutate({
              id: todo.id,
              payload: { archivedAt: todo.archivedAt ? null : new Date().toISOString() },
            })
          }
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ) : null}

      {items.length > 0 && layout === "board" ? (
        <TodoBoard
          boardGroups={boardGroups}
          statusLabels={STATUS_LABELS}
          formatDueAt={formatDueAt}
          onStatusChange={(id, status) => updateMutation.mutate({ id, payload: buildQuickStatusUpdatePayload(status) })}
          onEdit={setEditingTask}
          onToggleArchive={(todo) =>
            updateMutation.mutate({
              id: todo.id,
              payload: { archivedAt: todo.archivedAt ? null : new Date().toISOString() },
            })
          }
        />
      ) : null}
    </section>
  );
}
