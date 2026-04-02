import { render, screen } from "@testing-library/react";

import { Panel } from "../shared/ui/Panel";

describe("Panel", () => {
  it("supports a muted surface variant for secondary content blocks", () => {
    render(<Panel variant="muted">Secondary surface</Panel>);

    expect(screen.getByText("Secondary surface")).toHaveClass("bg-surfaceAlt");
  });
});
