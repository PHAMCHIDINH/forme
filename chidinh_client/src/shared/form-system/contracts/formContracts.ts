export const PRIMITIVE_V1 = Object.freeze([
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
] as const);

export const FORM_STATE_PRIORITY = Object.freeze(["error", "warning", "info"] as const);

const PRIMITIVE_V1_SET = new Set<string>(PRIMITIVE_V1);

export function isValidPrimitive(name: string): boolean {
  return PRIMITIVE_V1_SET.has(name);
}
