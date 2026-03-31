import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the application heading", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
  });
});
