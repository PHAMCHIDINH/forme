import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ContextToolbar } from "../shared/ui/ContextToolbar";

describe("ContextToolbar states", () => {
  test("marks selected scope as strongest non-CTA emphasis", () => {
    render(
      <ContextToolbar
        ariaLabel="Overview toolbar"
        scopeOptions={[
          { value: "all", label: "All" },
          { value: "planned", label: "Planned" },
        ]}
        selectedScope="planned"
        onScopeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Planned" })).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("region", { name: "Overview toolbar" })).toBeInTheDocument();
  });

  test("supports disabled and pending action states", () => {
    render(
      <ContextToolbar
        scopeOptions={[{ value: "all", label: "All" }]}
        selectedScope="all"
        onScopeChange={vi.fn()}
        secondaryActions={[{ label: "Export", onClick: vi.fn(), disabled: true }]}
        primaryAction={{ label: "Sync", onClick: vi.fn(), pending: true, disabled: true }}
      />,
    );

    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toHaveAttribute("data-pending", "true");
  });

  test("supports keyboard focus traversal and wrapped layout classes", async () => {
    const user = userEvent.setup();
    render(
      <ContextToolbar
        scopeOptions={[{ value: "all", label: "All" }]}
        selectedScope="all"
        onScopeChange={vi.fn()}
        searchValue=""
        onSearchChange={vi.fn()}
        secondaryActions={[{ label: "Reset", onClick: vi.fn() }]}
      />,
    );

    const toolbar = screen.getByRole("button", { name: "All" }).closest("section");
    expect(toolbar).toHaveClass("flex-wrap");

    await user.tab();
    expect(screen.getByRole("button", { name: "All" })).toHaveFocus();
  });
});
