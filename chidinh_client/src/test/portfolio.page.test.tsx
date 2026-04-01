import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";

describe("PortfolioPage", () => {
  it("renders the desktop portal windows and dock actions", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Public Desktop")).toHaveLength(2);
    expect(screen.getAllByRole("heading", { level: 1, name: /personal digital hub/i })).toHaveLength(2);
    expect(screen.getByText(/system archive/i)).toBeInTheDocument();
    expect(screen.getByText(/module registry/i)).toBeInTheDocument();
    expect(screen.getByText(/architecture notes/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /desktop dock/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^workspace$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /truy cập workspace/i })).toBeInTheDocument();
  });
});
