import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("RequireAuth", () => {
  it("shows shell loading status while session is loading", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("shell-status")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to the login page", async () => {
    mockFetchSequence(jsonResponse({ user: null }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { name: /enter workspace/i })).toBeInTheDocument();
  });
});
