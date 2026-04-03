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
});
