import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";

describe("PortfolioPage", () => {
  it("renders the public hub sections and workspace entry points", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore systems/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enter workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /operating principles/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /selected systems/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /live capabilities/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /architecture signal/i })).toBeInTheDocument();
  });
});
