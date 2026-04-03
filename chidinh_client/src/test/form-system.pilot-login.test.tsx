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
});
