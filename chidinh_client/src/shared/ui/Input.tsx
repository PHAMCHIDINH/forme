import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { InputShell } from "../form-system/primitives/InputShell";

type InputProps = ComponentPropsWithoutRef<typeof InputShell>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  props,
  ref,
) {
  return <InputShell ref={ref} {...props} />;
});
