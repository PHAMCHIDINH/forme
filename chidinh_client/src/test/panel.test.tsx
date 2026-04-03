import { render, screen } from "@testing-library/react";

import { Panel } from "../shared/ui/Panel";

describe("Panel", () => {
  it("renders panel variants with RetroUI framing", () => {
    render(
      <Panel data-testid="panel" variant="featured">
        Retro block
      </Panel>,
    );

    const panel = screen.getByTestId("panel");
    expect(panel.className).toContain("border-2");
    expect(panel.className).toContain("shadow-[var(--shadow-crisp-md)]");
    expect(panel.className).toContain("bg-[var(--surface-panel-featured)]");
  });
});
