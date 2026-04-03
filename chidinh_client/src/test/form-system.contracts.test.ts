import {
  FORM_STATE_PRIORITY,
  PRIMITIVE_V1,
  isValidPrimitive,
} from "../shared/form-system/contracts/formContracts";
import { isTwoColumnEligible } from "../shared/form-system/contracts/twoColumnEligibility";
import { reconcileDependentFieldState } from "../shared/form-system/contracts/dependentFieldState";

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

  it("rejects two-column eligibility when helper text is likely long", () => {
    expect(
      isTwoColumnEligible({
        layoutHasRoom: true,
        labelIsShort: true,
        controlIsCompact: true,
        helperTextIsShort: false,
        fieldHasSingleControl: true,
        fieldHasNoSupplementaryHint: true,
        fieldCanStayAligned: true,
      }),
    ).toBe(false);
  });

  it("accepts two-column eligibility only when all seven conditions are satisfied", () => {
    expect(
      isTwoColumnEligible({
        layoutHasRoom: true,
        labelIsShort: true,
        controlIsCompact: true,
        helperTextIsShort: true,
        fieldHasSingleControl: true,
        fieldHasNoSupplementaryHint: true,
        fieldCanStayAligned: true,
      }),
    ).toBe(true);
  });

  it("rejects two-column eligibility when any single criterion is false", () => {
    const baseCriteria = {
      layoutHasRoom: true,
      labelIsShort: true,
      controlIsCompact: true,
      helperTextIsShort: true,
      fieldHasSingleControl: true,
      fieldHasNoSupplementaryHint: true,
      fieldCanStayAligned: true,
    };

    (
      [
        "layoutHasRoom",
        "labelIsShort",
        "controlIsCompact",
        "helperTextIsShort",
        "fieldHasSingleControl",
        "fieldHasNoSupplementaryHint",
        "fieldCanStayAligned",
      ] as const
    ).forEach((criterion) => {
      expect(
        isTwoColumnEligible({
          ...baseCriteria,
          [criterion]: false,
        }),
      ).toBe(false);
    });
  });

  it("reconciles hidden dependent field state by clearing value, error, and touched", () => {
    expect(
      reconcileDependentFieldState({
        visible: false,
        value: "draft value",
        error: "Invalid selection",
        touched: true,
      }),
    ).toEqual({
      visible: false,
      value: null,
      error: null,
        touched: false,
      });
  });

  it("preserves visible dependent field state without resetting", () => {
    const state = {
      visible: true,
      value: "keep me",
      error: "Still invalid",
      touched: true,
    };

    expect(reconcileDependentFieldState(state)).toBe(state);
    expect(reconcileDependentFieldState(state)).toEqual(state);
  });
});
