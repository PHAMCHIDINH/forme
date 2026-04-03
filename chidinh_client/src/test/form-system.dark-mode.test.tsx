import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { LoginPage } from "../modules/auth/LoginPage";
import { ValidationSummary } from "../shared/form-system/patterns";
import { ErrorText } from "../shared/form-system/primitives/ErrorText";
import { HelperText } from "../shared/form-system/primitives/HelperText";
import { InputShell } from "../shared/form-system/primitives/InputShell";
import { SelectTrigger } from "../shared/form-system/primitives/SelectTrigger";
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
          <SelectTrigger aria-label="Dark select" value="planned" onChange={() => {}}>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
          </SelectTrigger>
          <HelperText>Dark helper copy</HelperText>
          <ErrorText>Dark error copy</ErrorText>
          <ValidationSummary errors={[{ fieldId: "dark-field", message: "Dark mode summary error" }]} />
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

    const helperText = screen.getByText("Dark helper copy");
    const errorText = screen.getByText("Dark error copy");
    const summary = screen.getByText("Dark mode summary error").closest("[role='alert']");

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("textbox", { name: "Dark field" })).toHaveClass("bg-[var(--input)]");
    expect(screen.getByRole("combobox", { name: "Dark select" })).toHaveClass("bg-[var(--input)]");
    expect(screen.getByRole("combobox", { name: "Dark select" })).toHaveClass("shadow-[var(--shadow-crisp-sm)]");
    expect(helperText).toHaveClass("text-muted-foreground");
    expect(errorText).toHaveClass("text-[var(--destructive)]");
    expect(summary).toHaveClass("bg-[var(--card)]");
    expect(summary).toHaveClass("border-[var(--destructive)]");
  });
});
