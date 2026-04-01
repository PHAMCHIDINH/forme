import { apiRequest } from "../../shared/api/client";

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listTodos() {
  return apiRequest<{ items: TodoItem[] }>("/api/v1/todos");
}

export async function createTodo(title: string) {
  return apiRequest<{ item: TodoItem }>("/api/v1/todos", {
    method: "POST",
    body: { title },
  });
}

export async function updateTodo(id: string, data: { title?: string; completed?: boolean }) {
  return apiRequest<{ item: TodoItem }>(`/api/v1/todos/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteTodo(id: string) {
  return apiRequest<{ success: boolean }>(`/api/v1/todos/${id}`, {
    method: "DELETE",
  });
}
