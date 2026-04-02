import {
  FORM_STATE_PRIORITY,
  PRIMITIVE_V1,
  isValidPrimitive,
} from "../shared/form-system/contracts/formContracts";

describe("form system contracts", () => {
  it("freezes the v1 primitive contract", () => {
    expect(Object.isFrozen(PRIMITIVE_V1)).toBe(true);
    expect(() => {
      (PRIMITIVE_V1 as unknown as string[]).push("InjectedField");
    }).toThrow(TypeError);

    expect(PRIMITIVE_V1).toEqual([
      "InputShell",
      "TextareaShell",
      "SelectTrigger",
      "Checkbox",
      "Radio",
      "Switch",
      "Label",
      "HelperText",
      "ErrorText",
      "Button",
      "Surface",
    ]);
  });

  it("freezes the form state priority contract", () => {
    expect(Object.isFrozen(FORM_STATE_PRIORITY)).toBe(true);
    expect(() => {
      (FORM_STATE_PRIORITY as unknown as string[]).push("critical");
    }).toThrow(TypeError);

    expect(FORM_STATE_PRIORITY).toEqual(["error", "warning", "info"]);
  });

  it("validates frozen primitive names", () => {
    expect(isValidPrimitive("InputShell")).toBe(true);
    expect(isValidPrimitive("MagicOneOffField")).toBe(false);
  });
});
