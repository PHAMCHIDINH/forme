import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the public desktop portal headline", () => {
    render(<App />);

    expect(screen.getAllByRole("heading", { level: 1, name: /personal digital hub/i })).toHaveLength(2);
    expect(screen.getByText(/curated desktop scene/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /desktop dock/i })).toBeInTheDocument();
  });
});
