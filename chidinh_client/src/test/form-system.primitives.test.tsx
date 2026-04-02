import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ErrorText } from "../shared/form-system/primitives/ErrorText";
import { HelperText } from "../shared/form-system/primitives/HelperText";
import { InputShell } from "../shared/form-system/primitives/InputShell";
import { Label } from "../shared/form-system/primitives/Label";
import { SelectTrigger } from "../shared/form-system/primitives/SelectTrigger";
import { TextareaShell } from "../shared/form-system/primitives/TextareaShell";
import { InlineFeedback } from "../shared/ui/InlineFeedback";
import { Input } from "../shared/ui/Input";

describe("form system primitives", () => {
  test("preserves InputShell state attributes", () => {
    render(<InputShell aria-label="Title" data-state="error" />);

    expect(screen.getByRole("textbox", { name: "Title" })).toHaveAttribute("data-state", "error");
  });

  test("renders HelperText with status semantics", () => {
    render(<HelperText>Helpful guidance</HelperText>);

    expect(screen.getByRole("status")).toHaveTextContent("Helpful guidance");
  });

  test("keeps HelperText canonical semantics when caller passes conflicting attributes", () => {
    render(
      <HelperText aria-live="assertive" role="alert">
        Helpful guidance
      </HelperText>,
    );

    const helperText = screen.getByRole("status");
    expect(helperText).toHaveAttribute("aria-live", "polite");
    expect(helperText).toHaveAttribute("role", "status");
  });

  test("renders ErrorText with alert semantics", () => {
    render(<ErrorText>Problem to fix</ErrorText>);

    expect(screen.getByRole("alert")).toHaveTextContent("Problem to fix");
  });

  test("keeps ErrorText canonical semantics when caller passes conflicting attributes", () => {
    render(
      <ErrorText aria-live="polite" role="status">
        Problem to fix
      </ErrorText>,
    );

    const errorText = screen.getByRole("alert");
    expect(errorText).toHaveAttribute("aria-live", "assertive");
    expect(errorText).toHaveAttribute("role", "alert");
  });

  test("defaults SelectTrigger to button type", () => {
    render(<SelectTrigger>Select a value</SelectTrigger>);

    expect(screen.getByRole("button", { name: "Select a value" })).toHaveAttribute("type", "button");
  });

  test("renders TextareaShell as a textarea and accepts className", () => {
    render(<TextareaShell aria-label="Notes" className="custom-textarea" />);

    expect(screen.getByRole("textbox", { name: "Notes" }).tagName).toBe("TEXTAREA");
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveClass("custom-textarea");
  });

  test("associates Label with its control through htmlFor", () => {
    render(
      <>
        <Label htmlFor="project-name">Project name</Label>
        <InputShell id="project-name" />
      </>,
    );

    expect(screen.getByLabelText("Project name")).toHaveAttribute("id", "project-name");
  });

  test("forwards className and data-state through Input wrapper", () => {
    render(<Input aria-label="Title" className="custom-input" data-state="warning" />);

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveClass("custom-input");
    expect(input).toHaveAttribute("data-state", "warning");
  });

  test("maps InlineFeedback tones to semantic roles", () => {
    render(
      <>
        <InlineFeedback>Helpful guidance</InlineFeedback>
        <InlineFeedback tone="error">Problem to fix</InlineFeedback>
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Helpful guidance");
    expect(screen.getByRole("alert")).toHaveTextContent("Problem to fix");
  });
});
