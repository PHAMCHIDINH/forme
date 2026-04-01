import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("DashboardLayout", () => {
  it("renders the private desktop shell with launcher and user context", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(/private workspace/i, { selector: ".system-bar__context" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /workspace launcher/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /todo/i })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });
});
