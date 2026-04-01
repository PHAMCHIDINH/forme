import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";

const todoSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Task title is too long"),
});

type TodoFormValues = z.infer<typeof todoSchema>;

export function TodoPage() {
  const queryClient = useQueryClient();
  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: listTodos,
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
    const completed = items.filter((item) => item.completed).length;

    return {
      total,
      completed,
      open: total - completed,
    };
  }, [items]);

  const createMutation = useMutation({
    mutationFn: (newTitle: string) => createTodo(newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo(id, { completed }),
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
    } catch {
      // Error is rendered from mutation state.
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Application"
        title="Todo App"
        description="The first live productivity application inside the private desktop."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-sm text-muted">Tasks</p>
          <p className="mt-3 text-2xl font-semibold text-text">{metrics.total} total</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">Open</p>
          <p className="mt-3 text-2xl font-semibold text-text">{metrics.open} open</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">Completed</p>
          <p className="mt-3 text-2xl font-semibold text-text">{metrics.completed} complete</p>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <div>
          <p className="text-sm font-medium text-text">Task Composer</p>
          <p className="mt-1 text-sm text-muted">
            Add the next execution item without leaving the app window.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 md:flex-row md:items-end"
          onSubmit={form.handleSubmit(handleCreate)}
        >
          <div className="flex-1 space-y-2">
            <label htmlFor="todo-title">Task Title</label>
            <input id="todo-title" placeholder="Add a new task" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-red-700">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <button
            className="desktop-submit inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding..." : "Add Task"}
          </button>
        </form>
      </Panel>

      {todosQuery.isLoading ? (
        <Panel>
          <p>Loading todos...</p>
        </Panel>
      ) : null}

      {todosQuery.isError ? (
        <Panel>
          <p>Failed to load todos.</p>
        </Panel>
      ) : null}

      {!todosQuery.isLoading && !todosQuery.isError && items.length === 0 ? (
        <Panel>
          <p className="text-xl font-semibold text-text">No active tasks yet.</p>
          <p className="mt-2 text-sm text-muted">
            Add your first item to start shaping the workspace rhythm.
          </p>
        </Panel>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((todo) => (
            <Panel className="flex items-center justify-between gap-4" key={todo.id}>
              <label className="flex items-center gap-3">
                <input
                  className="h-4 w-4"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(event) =>
                    updateMutation.mutate({
                      id: todo.id,
                      completed: event.target.checked,
                    })
                  }
                />
                <span>{todo.title}</span>
              </label>

              <button
                className="desktop-inline-action inline-flex items-center justify-center rounded-full px-4 py-2 text-sm"
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
