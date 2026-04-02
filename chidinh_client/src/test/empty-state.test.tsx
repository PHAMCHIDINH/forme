import { render, screen } from "@testing-library/react";

import { EmptyState } from "../shared/ui/EmptyState";

describe("EmptyState", () => {
  it("renders a consistent empty-state title and description", () => {
    render(
      <EmptyState
        title="No items yet"
        description="Create your first item to get started."
      />,
    );

    expect(screen.getByRole("heading", { name: /no items yet/i })).toBeInTheDocument();
    expect(screen.getByText(/create your first item to get started/i)).toBeInTheDocument();
  });
});
