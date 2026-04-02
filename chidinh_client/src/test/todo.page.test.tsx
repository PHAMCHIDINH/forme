import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

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

function sampleTask(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "task-1",
    title: "Review launch plan",
    descriptionHtml: "<p>Check blockers</p>",
    status: "in_progress",
    priority: "high",
    dueAt: "2026-04-03T02:00:00.000Z",
    tags: ["work", "launch"],
    completedAt: null,
    archivedAt: null,
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
    ...overrides,
  };
}

describe("TodoPage", () => {
  it("loads the all active view by default", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
    );

    renderTodoRoute();

    await screen.findByRole("heading", { name: /personal tasks/i });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const url = new URL(String(fetchMock.mock.calls[1][0]));
    expect(url.pathname).toBe("/api/v1/todos");
    expect(url.searchParams.get("view")).toBe("active");
  });

  it("passes search and view filters to the todo api", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
      jsonResponse({ items: [] }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    renderTodoRoute();
    await screen.findByRole("heading", { name: /personal tasks/i });

    await user.selectOptions(screen.getByLabelText(/view/i), "completed");
    await user.type(screen.getByLabelText(/search/i), "launch");

    await waitFor(() => {
      const hasFinalSearchCall = fetchMock.mock.calls.some((call) => {
        const url = new URL(String(call[0]));
        return url.searchParams.get("view") === "completed" && url.searchParams.get("q") === "launch";
      });
      expect(hasFinalSearchCall).toBe(true);
    });

    const viewUrl = new URL(String(fetchMock.mock.calls[2][0]));
    expect(viewUrl.searchParams.get("view")).toBe("completed");

    const searchCall = fetchMock.mock.calls.find((call) => {
      const url = new URL(String(call[0]));
      return url.searchParams.get("view") === "completed" && url.searchParams.get("q") === "launch";
    });
    expect(searchCall).toBeDefined();
    const searchUrl = new URL(String(searchCall?.[0]));
    expect(searchUrl.searchParams.get("view")).toBe("completed");
    expect(searchUrl.searchParams.get("q")).toBe("launch");
  });

  it("renders task metadata returned by the api", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          sampleTask(),
          sampleTask({
            id: "task-2",
            title: "Tidy backlog",
            status: "todo",
            priority: "medium",
            dueAt: null,
            tags: [],
          }),
        ],
      }),
    );

    renderTodoRoute();

    expect(await screen.findByText("Review launch plan")).toBeInTheDocument();
    expect(screen.getByText(/in_progress · high/i)).toBeInTheDocument();
    expect(screen.getByText(/#work #launch/i)).toBeInTheDocument();
    expect(screen.getByText(/todo · medium/i)).toBeInTheDocument();
  });

  it("submits full v2 payload with rich text, due date, and merged tags", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
      jsonResponse({
        item: sampleTask({
          id: "task-2",
          title: "Ship MVP",
          status: "done",
          priority: "high",
          dueAt: "2026-04-02T17:00:00.000Z",
          tags: ["work", "deep"],
        }),
      }),
      jsonResponse({ items: [] }),
    );
    const user = userEvent.setup();

    renderTodoRoute();
    await screen.findByRole("heading", { name: /personal tasks/i });

    await user.type(screen.getByLabelText(/task title/i), "Ship MVP");
    await user.selectOptions(screen.getByLabelText(/status/i), "done");
    await user.selectOptions(screen.getByLabelText(/priority/i), "high");
    await user.type(screen.getByLabelText(/due date/i), "2026-04-03");
    await user.click(screen.getByRole("button", { name: /\+ #work/i }));
    await user.type(screen.getByLabelText(/tags/i), "deep{enter}");

    const description = screen.getByRole("textbox", { name: /task description/i });
    fireEvent.input(description, {
      currentTarget: { innerHTML: "<p><strong>Finalize</strong> checklist</p>" },
      target: { innerHTML: "<p><strong>Finalize</strong> checklist</p>" },
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
    const payload = JSON.parse(String(postCall?.[1]?.body)) as Record<string, unknown>;

    expect(payload.title).toBe("Ship MVP");
    expect(payload.status).toBe("done");
    expect(payload.priority).toBe("high");
    expect(payload.tags).toEqual(["work", "deep"]);
    expect(payload.descriptionHtml).toContain("<strong>");
    expect(payload.dueAt).toBe("2026-04-02T17:00:00.000Z");
  });

  it("updates status from board view and keeps due date in app timezone", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({
        items: [
          sampleTask({
            id: "task-1",
            title: "Cross midnight due",
            status: "todo",
            dueAt: "2026-04-03T17:00:00.000Z",
            tags: ["work"],
          }),
        ],
      }),
      jsonResponse({
        item: sampleTask({
          id: "task-1",
          title: "Cross midnight due",
          status: "done",
          dueAt: "2026-04-03T17:00:00.000Z",
          tags: ["work"],
        }),
      }),
      jsonResponse({
        items: [
          sampleTask({
            id: "task-1",
            title: "Cross midnight due",
            status: "done",
            dueAt: "2026-04-03T17:00:00.000Z",
            tags: ["work"],
          }),
        ],
      }),
    );
    const user = userEvent.setup();

    renderTodoRoute();
    expect(await screen.findByText("Cross midnight due")).toBeInTheDocument();
    expect(screen.getByText(/due 2026-04-04/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/layout/i), "board");
    await user.selectOptions(screen.getByLabelText(/board status for cross midnight due/i), "done");

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
    const payload = JSON.parse(String(patchCall?.[1]?.body)) as Record<string, unknown>;
    expect(payload.status).toBe("done");
  });
});
