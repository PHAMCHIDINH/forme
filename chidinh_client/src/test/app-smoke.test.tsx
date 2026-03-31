import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the redesigned public hub headline", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByText(/modular architecture/i)).toBeInTheDocument();
  });
});
