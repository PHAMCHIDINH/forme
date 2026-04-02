import * as Label from "@radix-ui/react-label";
import type { PropsWithChildren } from "react";
import { InlineFeedback } from "./InlineFeedback";

type FieldProps = PropsWithChildren<{
  className?: string;
}>;

type FieldLabelProps = React.ComponentPropsWithoutRef<typeof Label.Root>;

type FieldMessageProps = PropsWithChildren<{
  className?: string;
  tone?: "default" | "error";
}>;

export function Field({ children, className = "" }: FieldProps) {
  return <div className={`space-y-2 ${className}`.trim()}>{children}</div>;
}

export function FieldLabel({ className = "", ...props }: FieldLabelProps) {
  return <Label.Root className={`text-sm font-medium text-text ${className}`.trim()} {...props} />;
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
