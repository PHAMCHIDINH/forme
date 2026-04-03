import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { LoginPage } from "../modules/auth/LoginPage";
import { InputShell } from "../shared/form-system/primitives/InputShell";
import { clearDocumentTheme, createTestQueryClient, setDocumentTheme } from "./test-utils";

function renderDarkModeHarness() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<p>Private dashboard</p>} />
          </Routes>
          <InputShell aria-label="Dark field" />
        </>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  clearDocumentTheme();
});

describe("form-system dark mode baseline", () => {
  test("keeps semantic surface and field classes under dark theme", () => {
    setDocumentTheme("dark");

    renderDarkModeHarness();

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("textbox", { name: "Dark field" })).toHaveClass("bg-[var(--input)]");
  });
});
