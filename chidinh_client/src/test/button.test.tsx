import { render, screen } from "@testing-library/react";
import { MemoryRouter, Link } from "react-router-dom";

import { Button } from "../shared/ui/Button";

describe("Button", () => {
  it("renders the primary button as a filled RetroUI CTA", () => {
    render(<Button type="button">Open Workspace</Button>);

    const button = screen.getByRole("button", { name: /open workspace/i });
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("border-2");
    expect(button.className).toContain("shadow-[var(--shadow-crisp-sm)]");
  });

  it("renders a native button by default", () => {
    render(
      <Button disabled type="button">
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: /save changes/i });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toBeDisabled();
  });

  it("can style a router link without changing link semantics", () => {
    render(
      <MemoryRouter>
        <Button asChild>
          <Link to="/login">Enter Workspace</Link>
        </Button>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /enter workspace/i });

    expect(link).toHaveAttribute("href", "/login");
    expect(link.className).toContain("inline-flex");
  });

  it("renders ghost buttons as low-emphasis actions", () => {
    render(
      <Button type="button" variant="ghost">
        Learn more
      </Button>,
    );

    const button = screen.getByRole("button", { name: /learn more/i });

    expect(button.className).toContain("bg-transparent");
    expect(button.className).toContain("shadow-none");
    expect(button.className).toContain("hover:bg-[var(--surface-panel-muted)]");
  });

  it("renders selected scope buttons as visibly stronger than unselected scope buttons", () => {
    render(
      <div>
        <Button type="button" variant="scope">
          All
        </Button>
        <Button selected type="button" variant="scope">
          Planned
        </Button>
      </div>,
    );

    const unselected = screen.getByRole("button", { name: /all/i });
    const selected = screen.getByRole("button", { name: /planned/i });

    expect(selected).toHaveAttribute("data-selected", "true");
    expect(unselected.className).toContain("bg-accent");
    expect(selected.className).toContain("bg-[var(--surface-panel-featured)]");
    expect(selected.className).toContain("shadow-[var(--shadow-crisp-md)]");
    expect(selected.className).not.toBe(unselected.className);
  });

  it("keeps selected styling for scope buttons", () => {
    render(
      <Button selected type="button" variant="scope">
        Planned
      </Button>,
    );

    const button = screen.getByRole("button", { name: /planned/i });

    expect(button).toHaveAttribute("data-selected", "true");
    expect(button.className).toContain("data-[selected=true]:bg-[var(--surface-panel-featured)]");
  });
});
