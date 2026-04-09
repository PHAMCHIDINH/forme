import type { HTMLAttributes, PropsWithChildren } from "react";

type ConditionalFieldBlockProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    visible: boolean;
  }
>;

export function ConditionalFieldBlock({ children, className, visible, ...props }: ConditionalFieldBlockProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={["space-y-4", className].filter(Boolean).join(" ")}
      data-slot="conditional-field-block"
      {...props}
    >
      {children}
    </div>
  );
}
