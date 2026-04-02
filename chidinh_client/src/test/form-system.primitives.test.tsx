import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { InputShell } from "../shared/form-system/primitives/InputShell";

describe("form system primitives", () => {
  test("preserves InputShell state attributes", () => {
    render(<InputShell aria-label="Title" data-state="error" />);

    expect(screen.getByRole("textbox", { name: "Title" })).toHaveAttribute("data-state", "error");
  });
});
