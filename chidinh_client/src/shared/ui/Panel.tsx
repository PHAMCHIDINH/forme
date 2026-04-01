import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className = "" }: Props) {
  return <div className={`desktop-panel ${className}`.trim()}>{children}</div>;
}
