import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

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

describe("TodoPage form-system pilot", () => {
  test("shows a validation summary on submit while keeping the inline title error", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    const { container } = renderTodoRoute();
    await screen.findByRole("heading", { name: /personal tasks/i });

    await user.click(screen.getByRole("button", { name: /add task/i }));

    await waitFor(() => {
      expect(container.querySelector('[data-slot="validation-summary"]')).toBeInTheDocument();
    });

    expect(screen.getByText(/please fix the following 1 field/i)).toBeInTheDocument();
    expect(screen.getAllByText("Task title is required")).toHaveLength(2);
    expect(screen.getByLabelText(/task title/i)).toHaveAttribute("aria-invalid", "true");
  });

  test("clears hidden due date state when status change hides the dependent field", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
      jsonResponse({ item: { id: "task-2", title: "Close sprint", status: "done", priority: "medium", dueAt: null, tags: [], descriptionHtml: "", completedAt: null, archivedAt: null, createdAt: "2026-04-02T10:00:00.000Z", updatedAt: "2026-04-02T10:00:00.000Z" } }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    renderTodoRoute();
    await screen.findByRole("heading", { name: /personal tasks/i });

    await user.type(screen.getByLabelText(/task title/i), "Close sprint");
    await user.type(screen.getByLabelText(/due date/i), "2026-04-03");
    await user.selectOptions(screen.getByLabelText(/status/i), "done");

    await waitFor(() => {
      expect(screen.queryByLabelText(/due date/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /add task/i }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((call) => {
        const init = call[1] as RequestInit | undefined;
        return init?.method === "POST";
      });
      expect(postCall).toBeDefined();
    });

    const postCall = fetchMock.mock.calls.find((call) => {
      const init = call[1] as RequestInit | undefined;
      return init?.method === "POST";
    });
    const payload = readJsonBody(postCall?.[1]);

    expect(payload?.title).toBe("Close sprint");
    expect(payload).not.toHaveProperty("dueAt");
  });

  test("editing an existing done task clears a legacy due date on save", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          {
            id: "task-3",
            title: "Wrap retrospective",
            status: "done",
            priority: "medium",
            dueAt: "2026-04-03T17:00:00.000Z",
            tags: ["ops"],
            descriptionHtml: "",
            completedAt: null,
            archivedAt: null,
            createdAt: "2026-04-02T10:00:00.000Z",
            updatedAt: "2026-04-02T10:00:00.000Z",
          },
        ],
      }),
      jsonResponse({
        item: {
          id: "task-3",
          title: "Wrap retrospective",
          status: "done",
          priority: "medium",
          dueAt: null,
          tags: ["ops"],
          descriptionHtml: "",
          completedAt: null,
          archivedAt: null,
          createdAt: "2026-04-02T10:00:00.000Z",
          updatedAt: "2026-04-02T10:00:00.000Z",
        },
      }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    renderTodoRoute();
    await screen.findByText("Wrap retrospective");

    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.queryByLabelText(/due date/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /save task/i }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find((call) => {
        const init = call[1] as RequestInit | undefined;
        return init?.method === "PATCH";
      });
      expect(patchCall).toBeDefined();
    });

    const patchCall = fetchMock.mock.calls.find((call) => {
      const init = call[1] as RequestInit | undefined;
      return init?.method === "PATCH";
    });
    const payload = readJsonBody(patchCall?.[1]);

    expect(payload?.status).toBe("done");
    expect(payload?.dueAt).toBeNull();
  });
});
