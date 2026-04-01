import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className = "" }: Props) {
  return (
    <div
      className={`border-2 border-border bg-card p-4 shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
