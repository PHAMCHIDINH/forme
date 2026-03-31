import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";

export function TodoPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: listTodos,
  });

  const createMutation = useMutation({
    mutationFn: (newTitle: string) => createTodo(newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
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

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    try {
      await createMutation.mutateAsync(trimmed);
      setTitle("");
    } catch (error) {
      // Error is rendered from mutation state.
    }
  };

  return (
    <section>
      <h2>Todo</h2>

      <form onSubmit={handleCreate}>
        <label htmlFor="todo-title">Task Title</label>
        <input
          id="todo-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit" disabled={createMutation.isPending}>
          Add Task
        </button>
      </form>

      {todosQuery.isLoading ? <p>Loading todos...</p> : null}
      {todosQuery.isError ? <p>Failed to load todos.</p> : null}

      <ul>
        {(todosQuery.data?.items ?? []).map((todo) => (
          <li key={todo.id}>
            <label>
              <input
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

            <button type="button" onClick={() => deleteMutation.mutate(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
