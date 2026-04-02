import type { PropsWithChildren } from "react";

type InlineFeedbackProps = PropsWithChildren<{
  className?: string;
  tone?: "default" | "error";
}>;

export function InlineFeedback({
  children,
  className = "",
  tone = "default",
}: InlineFeedbackProps) {
  const toneClass = tone === "error" ? "text-red-700" : "text-muted";
  const role = tone === "error" ? "alert" : "status";

  return (
    <p className={`text-sm ${toneClass} ${className}`.trim()} role={role}>
      {children}
    </p>
  );
}
