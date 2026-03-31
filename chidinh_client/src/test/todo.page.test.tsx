import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence, readJsonBody } from "./test-utils";

function renderTodoRoute() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app/todo"]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TodoPage", () => {
  it("renders the todo list", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          {
            id: "todo-1",
            title: "Ship the first release",
            completed: false,
            createdAt: "2026-03-31T00:00:00.000Z",
            updatedAt: "2026-03-31T00:00:00.000Z",
          },
        ],
      }),
    );

    renderTodoRoute();

    expect(await screen.findByRole("heading", { name: /todo/i })).toBeInTheDocument();
    expect(await screen.findByText("Ship the first release")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Ship the first release" })).not.toBeChecked();
  });

  it("creates a todo", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
      jsonResponse({
        item: {
          id: "todo-2",
          title: "Write frontend tests",
          completed: false,
          createdAt: "2026-03-31T00:00:00.000Z",
          updatedAt: "2026-03-31T00:00:00.000Z",
        },
      }),
      jsonResponse({
        items: [
          {
            id: "todo-2",
            title: "Write frontend tests",
            completed: false,
            createdAt: "2026-03-31T00:00:00.000Z",
            updatedAt: "2026-03-31T00:00:00.000Z",
          },
        ],
      }),
    );
    const user = userEvent.setup();

    renderTodoRoute();

    await screen.findByRole("heading", { name: /todo/i });

    await user.type(screen.getByLabelText(/task title/i), "Write frontend tests");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    await screen.findByText("Write frontend tests");

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(new URL(String(fetchMock.mock.calls[2][0])).pathname).toBe("/api/v1/todos");
    expect(readJsonBody(fetchMock.mock.calls[2][1])).toEqual({ title: "Write frontend tests" });
  });

  it("toggles a todo", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          {
            id: "todo-3",
            title: "Review release notes",
            completed: false,
            createdAt: "2026-03-31T00:00:00.000Z",
            updatedAt: "2026-03-31T00:00:00.000Z",
          },
        ],
      }),
      jsonResponse({
        item: {
          id: "todo-3",
          title: "Review release notes",
          completed: true,
          createdAt: "2026-03-31T00:00:00.000Z",
          updatedAt: "2026-03-31T00:00:00.000Z",
        },
      }),
      jsonResponse({
        items: [
          {
            id: "todo-3",
            title: "Review release notes",
            completed: true,
            createdAt: "2026-03-31T00:00:00.000Z",
            updatedAt: "2026-03-31T00:00:00.000Z",
          },
        ],
      }),
    );
    const user = userEvent.setup();

    renderTodoRoute();

    const checkbox = await screen.findByRole("checkbox", { name: "Review release notes" });
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(new URL(String(fetchMock.mock.calls[2][0])).pathname).toBe("/api/v1/todos/todo-3");
    expect(readJsonBody(fetchMock.mock.calls[2][1])).toEqual({ completed: true });
  });

  it("deletes a todo", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          {
            id: "todo-4",
            title: "Draft release checklist",
            completed: false,
            createdAt: "2026-03-31T00:00:00.000Z",
            updatedAt: "2026-03-31T00:00:00.000Z",
          },
        ],
      }),
      jsonResponse({ success: true }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    renderTodoRoute();

    await screen.findByText("Draft release checklist");
    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(screen.queryByText("Draft release checklist")).not.toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(new URL(String(fetchMock.mock.calls[2][0])).pathname).toBe("/api/v1/todos/todo-4");
  });
});
