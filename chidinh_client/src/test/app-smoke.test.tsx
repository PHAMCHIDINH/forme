import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the public desktop portal headline", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(
      screen.getByText(/curated desktop scene/i, { selector: ".window-frame__subtitle" }),
    ).toBeInTheDocument();
  });
});
