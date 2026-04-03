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

  test("styles InputShell as a hard-edged field shell", () => {
    render(<InputShell aria-label="Project name" />);

    const input = screen.getByRole("textbox", { name: "Project name" });
    expect(input).toHaveClass("border-2");
    expect(input).toHaveClass("shadow-[var(--shadow-crisp-sm)]");
  });

  test("keeps readonly inputs visually distinct from disabled inputs", () => {
    render(
      <>
        <InputShell aria-label="Readonly title" readOnly value="Visible value" />
        <InputShell aria-label="Disabled title" disabled value="Hidden affordance" />
      </>,
    );

    const readonlyInput = screen.getByRole("textbox", { name: "Readonly title" });
    const disabledInput = screen.getByRole("textbox", { name: "Disabled title" });

    expect(readonlyInput).toHaveClass("read-only:bg-[var(--surface-panel-muted)]");
    expect(readonlyInput).toHaveAttribute("readonly");
    expect(readonlyInput).not.toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
    expect(disabledInput).toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
    expect(disabledInput).toBeDisabled();
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

  test("renders SelectTrigger as a native select control", () => {
    render(
      <SelectTrigger aria-label="Select a value" value="" onChange={() => {}}>
        <option value="">Select a value</option>
      </SelectTrigger>,
    );

    expect(screen.getByRole("combobox", { name: "Select a value" }).tagName).toBe("SELECT");
  });

  test("renders SelectTrigger as a native select with shared field shell styling", () => {
    render(
      <SelectTrigger aria-label="Project status" value="planned" onChange={() => {}}>
        <option value="planned">Planned</option>
        <option value="active">Active</option>
      </SelectTrigger>,
    );

    const trigger = screen.getByRole("combobox", { name: "Project status" });

    expect(trigger.tagName).toBe("SELECT");
    expect(trigger).toHaveClass("rounded-[var(--radius-md)]");
    expect(trigger).toHaveClass("appearance-none");
    expect(trigger).toHaveClass("pr-10");
  });

  test("renders disabled SelectTrigger with shared disabled shell styling", () => {
    render(
      <SelectTrigger aria-label="Project status" disabled value="planned" onChange={() => {}}>
        <option value="planned">Planned</option>
        <option value="active">Active</option>
      </SelectTrigger>,
    );

    const trigger = screen.getByRole("combobox", { name: "Project status" });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
    expect(trigger).toHaveClass("disabled:text-muted-foreground");
  });

  test("renders TextareaShell as a textarea and accepts className", () => {
    render(<TextareaShell aria-label="Notes" className="custom-textarea" />);

    expect(screen.getByRole("textbox", { name: "Notes" }).tagName).toBe("TEXTAREA");
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveClass("custom-textarea");
  });

  test("keeps readonly textarea distinct from disabled textarea", () => {
    render(
      <>
        <TextareaShell aria-label="Readonly notes" readOnly value="Review only" />
        <TextareaShell aria-label="Disabled notes" disabled value="Blocked" />
      </>,
    );

    const readonlyTextarea = screen.getByRole("textbox", { name: "Readonly notes" });
    const disabledTextarea = screen.getByRole("textbox", { name: "Disabled notes" });

    expect(readonlyTextarea).toHaveAttribute("readonly");
    expect(readonlyTextarea).toHaveClass("read-only:bg-[var(--surface-panel-muted)]");
    expect(readonlyTextarea).not.toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
    expect(disabledTextarea).toBeDisabled();
    expect(disabledTextarea).toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
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
