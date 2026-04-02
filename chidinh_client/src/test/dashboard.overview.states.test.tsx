import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { DashboardHomePage } from "../modules/dashboard/DashboardHomePage";

describe("Dashboard overview empty-state", () => {
  test("shows empty state when context returns zero modules", async () => {
    const user = userEvent.setup();
    render(<DashboardHomePage />);

    await user.click(screen.getByRole("button", { name: /^planned$/i }));
    await user.selectOptions(screen.getByLabelText(/module state/i), "live");

    expect(screen.getByText(/No modules match this view/i)).toBeInTheDocument();
  });

  test("renders a second toolbar instance without local rescue markers", () => {
    render(<DashboardHomePage />);

    expect(screen.getByRole("region", { name: /overview context toolbar/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /module deck toolbar/i })).toBeInTheDocument();
    expect(document.querySelectorAll("[data-toolbar-local-override]").length).toBe(0);
  });
});
