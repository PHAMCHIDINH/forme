import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { LoginPage } from "../modules/auth/LoginPage";
import { createTestQueryClient } from "./test-utils";

function renderLoginRoute() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<p>Private dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LoginPage form-system pilot", () => {
  test("renders a stable action area for the primary submit action", () => {
    renderLoginRoute();

    expect(screen.getByRole("heading", { name: /enter workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enter workspace/i })).toBeInTheDocument();
    expect(screen.getByTestId("form-action-area")).toBeInTheDocument();
  });

  test("keeps helper text wired to the username field", () => {
    renderLoginRoute();

    const username = screen.getByLabelText(/username/i);
    const helper = screen.getByText((content, node) => {
      return node?.id === "login-username-helper" && content.includes("workspace handle");
    });

    expect(username).toHaveAttribute("aria-describedby", "login-username-helper");
    expect(helper).toBeInTheDocument();
    expect(helper).toHaveTextContent(/workspace handle/i);
    expect(helper.textContent?.trim().split(/\s+/).length).toBeGreaterThan(8);
  });

  test("keeps the login shell single-column by default and upgrades to the desktop split only at lg", () => {
    renderLoginRoute();

    const shell = screen.getByTestId("login-shell-grid");

    expect(shell).toHaveClass("grid");
    expect(shell).toHaveClass("gap-6");
    expect(shell).toHaveClass("lg:grid-cols-[1fr_0.92fr]");
  });
});
