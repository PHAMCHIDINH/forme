import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Button as PrimitiveButton } from "../shared/form-system/primitives/Button";
import { Checkbox } from "../shared/form-system/primitives/Checkbox";
import { ErrorText } from "../shared/form-system/primitives/ErrorText";
import { HelperText } from "../shared/form-system/primitives/HelperText";
import { InputShell } from "../shared/form-system/primitives/InputShell";
import { Label } from "../shared/form-system/primitives/Label";
import { Radio } from "../shared/form-system/primitives/Radio";
import { SelectTrigger } from "../shared/form-system/primitives/SelectTrigger";
import { Surface } from "../shared/form-system/primitives/Surface";
import { Switch } from "../shared/form-system/primitives/Switch";
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

  test("renders Checkbox with checkbox semantics", () => {
    render(<Checkbox aria-label="Subscribe" defaultChecked />);

    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeChecked();
  });

  test("renders Radio with radio semantics", () => {
    render(<Radio aria-label="Primary option" name="priority" defaultChecked />);

    expect(screen.getByRole("radio", { name: "Primary option" })).toBeChecked();
  });

  test("renders Switch with switch semantics and change callback", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Switch aria-label="Notifications" checked={false} onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch", { name: "Notifications" }));

    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  test("renders primitive Button with shared button behavior", () => {
    render(
      <PrimitiveButton pending type="button">
        Save
      </PrimitiveButton>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("data-pending", "true");
  });

  test("renders Surface as a panel-like primitive container", () => {
    render(
      <Surface className="custom-surface" data-testid="surface" variant="featured">
        Surface content
      </Surface>,
    );

    const surface = screen.getByTestId("surface");
    expect(surface).toHaveClass("custom-surface");
  });
});
