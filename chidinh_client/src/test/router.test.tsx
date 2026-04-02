import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { APP_ROUTES, AppRoutes } from "../app/router/AppRouter";

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
});
