import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient } from "./test-utils";

describe("App routes", () => {
  it("renders the desktop portal on the public route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/public desktop/i, { selector: ".system-bar__context" })).toBeInTheDocument();
  });

  it("renders the access window on the login route", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText(/workspace access/i, { selector: ".system-bar__context" }),
    ).toBeInTheDocument();
  });
});
