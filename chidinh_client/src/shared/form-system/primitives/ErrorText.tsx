import type { HTMLAttributes } from "react";

type ErrorTextProps = Omit<HTMLAttributes<HTMLParagraphElement>, "aria-live" | "data-tone" | "role"> & {
  "aria-live"?: never;
  "data-tone"?: never;
  role?: never;
};

export function ErrorText({ className, ...props }: ErrorTextProps) {
  return (
    <p
      {...props}
      className={[
        "text-sm leading-6 text-[var(--form-state-error-text)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="assertive"
      data-tone="error"
      role="alert"
    />
  );
}
