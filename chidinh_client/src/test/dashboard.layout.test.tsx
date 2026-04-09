import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { SHELL_NAV_ITEMS } from "../modules/dashboard/shellNav";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("DashboardLayout", () => {
  it("renders the private shell with context and navigation", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { name: /workspace overview/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /dashboard navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /public hub/i })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /overview context toolbar/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /module deck toolbar/i })).toBeInTheDocument();
  });

  it("renders shell navigation from shared config", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: /workspace overview/i });

    for (const item of SHELL_NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toBeInTheDocument();
    }
  });

  it("renders planned dashboard modules on muted surfaces", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: /workspace overview/i });

    for (const label of screen.getAllByText(/planned module/i)) {
      expect(label.closest("div")).toHaveClass("bg-secondary");
    }
  });

  it("renders dashboard layout controls with framed shell surfaces", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const navigation = await screen.findByRole("navigation", { name: /dashboard navigation/i });
    const sidebarShell = navigation.parentElement;
    const shellGrid = sidebarShell?.parentElement;

    expect(screen.getByText("Context")).toHaveClass("border-2", "bg-card");
    expect(screen.getByText(/^Private Workspace$/i)).toHaveClass("font-black", "uppercase");
    expect(sidebarShell).toHaveClass("bg-secondary");
    expect(shellGrid).toHaveClass("lg:grid-cols-[280px_1fr]");
  });
});
