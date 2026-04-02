import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { DashboardHomePage } from "../modules/dashboard/DashboardHomePage";

afterEach(() => {
  document.documentElement.removeAttribute("data-ui-reduction");
});

describe("Dashboard reduction mode", () => {
  test("keeps featured and passive hierarchy under reduced chrome", () => {
    document.documentElement.setAttribute("data-ui-reduction", "true");

    render(<DashboardHomePage />);

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getAllByText(/Planned Module/i).length).toBeGreaterThan(0);
  });
});
