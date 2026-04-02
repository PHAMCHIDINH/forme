import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

import { Label as PrimitiveLabel } from "../form-system/primitives/Label";
import { InlineFeedback } from "./InlineFeedback";

type FieldProps = PropsWithChildren<{
  className?: string;
}>;

type FieldLabelProps = ComponentPropsWithoutRef<typeof PrimitiveLabel>;

type FieldMessageProps = PropsWithChildren<{
  className?: string;
  tone?: "default" | "error";
}>;

export function Field({ children, className = "" }: FieldProps) {
  return <div className={`space-y-2 ${className}`.trim()}>{children}</div>;
}

export function FieldLabel({ className = "", ...props }: FieldLabelProps) {
  return <PrimitiveLabel className={className} {...props} />;
}

export function FieldMessage({
  children,
  className = "",
  tone = "default",
}: FieldMessageProps) {
  return (
    <InlineFeedback className={className} tone={tone}>
      {children}
    </InlineFeedback>
  );
}
