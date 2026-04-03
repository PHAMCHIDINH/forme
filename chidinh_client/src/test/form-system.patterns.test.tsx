import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  ActionArea,
  ConditionalFieldBlock,
  FieldRow,
  FormSection,
  SectionHeader,
  ValidationSummary,
} from "../shared/form-system/patterns";

describe("form system patterns", () => {
  test("FieldRow keeps the base grid classes for one column", () => {
    render(<FieldRow data-testid="field-row-default" />);

    const row = screen.getByTestId("field-row-default");
    expect(row).toHaveClass("grid");
    expect(row).toHaveClass("gap-5");
    expect(row).not.toHaveClass("md:grid-cols-2");
    expect(row).toHaveAttribute("data-columns", "1");
  });

  test("FieldRow applies the two-column class when requested", () => {
    render(<FieldRow columns={2} data-testid="field-row-two-column" />);

    const row = screen.getByTestId("field-row-two-column");
    expect(row).toHaveClass("grid");
    expect(row).toHaveClass("gap-5");
    expect(row).toHaveClass("md:grid-cols-2");
    expect(row).toHaveAttribute("data-columns", "2");
  });

  test("FormSection labels the section from SectionHeader heading id", () => {
    render(
      <FormSection
        data-testid="project-section"
        headingId="project-details-heading"
        header={
          <SectionHeader
            description="Define the primary project metadata."
            headingId="project-details-heading"
            title="Project details"
          />
        }
      >
        <div>Body content</div>
      </FormSection>,
    );

    const section = screen.getByTestId("project-section");
    const heading = screen.getByRole("heading", { level: 2, name: "Project details" });

    expect(heading).toHaveAttribute("id", "project-details-heading");
    expect(section).toHaveAttribute("aria-labelledby", "project-details-heading");
  });

  test("ValidationSummary renders an alert container when errors exist", () => {
    render(
      <ValidationSummary
        errors={[
          { fieldId: "project-name", message: "Project name is required" },
          { fieldId: "project-summary", message: "Project summary is required" },
        ]}
      />,
    );

    const summary = screen.getByRole("alert");
    expect(summary).toHaveTextContent("Please fix the following 2 fields:");
    expect(within(summary).getByRole("link", { name: "Project name is required" })).toHaveAttribute(
      "href",
      "#project-name",
    );
    expect(within(summary).getByRole("link", { name: "Project summary is required" })).toHaveAttribute(
      "href",
      "#project-summary",
    );
  });

  test("renders ValidationSummary as a framed alert block", () => {
    render(<ValidationSummary errors={[{ fieldId: "title", message: "Title is required" }]} />);

    const summary = screen.getByRole("alert");
    expect(summary).toHaveClass("border-2");
    expect(summary).toHaveClass("shadow-[var(--shadow-crisp-sm)]");
  });

  test("ValidationSummary returns null when no errors are present", () => {
    const { container } = render(<ValidationSummary errors={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("ConditionalFieldBlock hides content when not visible and shows content when visible", () => {
    const { rerender } = render(
      <ConditionalFieldBlock visible={false}>
        <div>Advanced options</div>
      </ConditionalFieldBlock>,
    );

    expect(screen.queryByText("Advanced options")).not.toBeInTheDocument();

    rerender(
      <ConditionalFieldBlock visible>
        <div>Advanced options</div>
      </ConditionalFieldBlock>,
    );

    expect(screen.getByText("Advanced options")).toBeInTheDocument();
  });

  test("ActionArea exposes stable containers for primary and secondary actions", () => {
    render(
      <ActionArea
        primary={<button type="submit">Save</button>}
        secondary={<button type="button">Cancel</button>}
      />,
    );

    const actionArea = screen.getByTestId("action-area");
    expect(actionArea).toHaveAttribute("data-slot", "action-area");
    expect(within(screen.getByTestId("action-area-secondary")).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(within(screen.getByTestId("action-area-primary")).getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
