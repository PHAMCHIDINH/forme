import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { APP_ROUTES, AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("App routes", () => {
  it("renders portfolio content on the public route", () => {
    render(
      <MemoryRouter initialEntries={[APP_ROUTES.publicHome]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /selected systems/i })).toBeInTheDocument();
  });

  it("keeps unknown routes anchored to the public home route", () => {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /back to portfolio/i })).toHaveAttribute(
      "href",
      APP_ROUTES.publicHome,
    );
  });

  it("renders the journal page inside the private workspace route", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
    );

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[APP_ROUTES.journal]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { name: /watch and read journal/i })).toBeInTheDocument();
  });
});
