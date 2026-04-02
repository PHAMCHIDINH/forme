import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";
import { TaskItem, TaskListView } from "./taskTypes";

const todoSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Task title is too long"),
});

type TodoFormValues = z.infer<typeof todoSchema>;

export function TodoPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<TaskListView>("active");
  const [search, setSearch] = useState("");

  const todosQuery = useQuery({
    queryKey: ["todos", view, search],
    queryFn: () => listTodos({ view, q: search || undefined }),
  });

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
    },
  });

  const items = todosQuery.data?.items ?? [];
  const metrics = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.status === "done").length;

    return {
      total,
      completed,
      open: total - completed,
    };
  }, [items]);

  const createMutation = useMutation({
    mutationFn: (newTitle: string) => createTodo({ title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskItem["status"] }) =>
      updateTodo(id, { status }),
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

  const handleCreate = async ({ title }: TodoFormValues) => {
    try {
      await createMutation.mutateAsync(title);
    } catch (error) {
      // Error is rendered from mutation state.
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Operations"
        title="Personal Tasks"
        description="Track active execution tasks inside the private workspace."
      />

      <Panel className="p-5">
        <div className="grid gap-3 md:grid-cols-2">
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, tags"
            />
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
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={form.handleSubmit(handleCreate)}>
          <div className="flex-1 space-y-2">
            <label htmlFor="todo-title">Task Title</label>
            <input
              id="todo-title"
              placeholder="Add a new task"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-sm text-red-700">{form.formState.errors.title.message}</p>
            ) : null}
          </div>
          <button
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding..." : "Add Task"}
          </button>
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

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((todo) => (
            <Panel className="flex items-center justify-between gap-4 p-5" key={todo.id}>
              <label className="flex items-center gap-3">
                <input
                  className="h-4 w-4"
                  type="checkbox"
                  checked={todo.status === "done"}
                  onChange={(event) =>
                    updateMutation.mutate({
                      id: todo.id,
                      status: event.target.checked ? "done" : "todo",
                    })
                  }
                />
                <span>
                  <span>{todo.title}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {todo.status} · {todo.priority}
                    {todo.dueAt ? ` · due ${new Date(todo.dueAt).toLocaleDateString("en-CA")}` : ""}
                    {todo.tags.length > 0 ? ` · #${todo.tags.join(" #")}` : ""}
                  </span>
                </span>
              </label>

              <button
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
                type="button"
                onClick={() => deleteMutation.mutate(todo.id)}
              >
                Delete
              </button>
            </Panel>
          ))}
        </div>
      ) : null}
    </section>
  );
}
