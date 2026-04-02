import type { PropsWithChildren } from "react";

import { ErrorText } from "../form-system/primitives/ErrorText";
import { HelperText } from "../form-system/primitives/HelperText";

type InlineFeedbackProps = PropsWithChildren<{
  className?: string;
  tone?: "default" | "error";
}>;

export function InlineFeedback({
  children,
  className = "",
  tone = "default",
}: InlineFeedbackProps) {
  if (tone === "error") {
    return <ErrorText className={className}>{children}</ErrorText>;
  }

  return <HelperText className={className}>{children}</HelperText>;
}
