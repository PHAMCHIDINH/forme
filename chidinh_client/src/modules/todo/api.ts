import { apiRequest } from "../../shared/api/client";
import { CreateTaskInput, ListTodosParams, TaskItem, UpdateTaskInput } from "./taskTypes";

export type { TaskItem } from "./taskTypes";

export async function listTodos(params: ListTodosParams = {}) {
  const searchParams = new URLSearchParams();
  const view = params.view ?? "active";
  searchParams.set("view", view);
  if (params.q) {
    searchParams.set("q", params.q);
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.tag) {
    searchParams.set("tag", params.tag);
  }

  return apiRequest<{ items: TaskItem[] }>(`/api/v1/todos?${searchParams.toString()}`);
}

export async function createTodo(input: CreateTaskInput) {
  return apiRequest<{ item: TaskItem }>("/api/v1/todos", {
    method: "POST",
    body: input,
  });
}

export async function updateTodo(id: string, data: UpdateTaskInput) {
  return apiRequest<{ item: TaskItem }>(`/api/v1/todos/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteTodo(id: string) {
  return apiRequest<{ success: boolean }>(`/api/v1/todos/${id}`, {
    method: "DELETE",
  });
}
