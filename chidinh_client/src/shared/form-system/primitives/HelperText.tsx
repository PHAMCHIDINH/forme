import type { HTMLAttributes } from "react";

type HelperTextProps = Omit<HTMLAttributes<HTMLParagraphElement>, "aria-live" | "data-tone" | "role"> & {
  "aria-live"?: never;
  "data-tone"?: never;
  role?: never;
};

export function HelperText({ className, ...props }: HelperTextProps) {
  return (
    <p
      {...props}
      className={["text-sm leading-6 text-muted-foreground", className].filter(Boolean).join(" ")}
      aria-live="polite"
      data-tone="default"
      role="status"
    />
  );
}
