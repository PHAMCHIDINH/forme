import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";

function renderPortfolioPage() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("PortfolioPage", () => {
  it("renders the portfolio hero with framed RetroUI blocks", () => {
    renderPortfolioPage();

    expect(screen.getByRole("heading", { name: /personal digital hub/i }).className).toContain(
      "uppercase",
    );
  });

  it("renders the public hub sections and workspace entry points", () => {
    renderPortfolioPage();

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore systems/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enter workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /operating principles/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /selected systems/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /live capabilities/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /architecture signal/i })).toBeInTheDocument();
  });
});
