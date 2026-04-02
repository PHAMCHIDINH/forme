import { cva, type VariantProps } from "class-variance-authority";
import type { PropsWithChildren } from "react";

const panelVariants = cva("rounded-[var(--radius-lg)] border", {
  variants: {
    variant: {
      default: "border-[var(--border-default)] bg-[var(--surface-panel)]",
      muted: "border-[var(--border-subtle)] bg-surfaceAlt bg-[var(--surface-panel-muted)]",
      featured: "border-[var(--border-strong)] bg-[var(--surface-panel-featured)] shadow-md",
      shell: "border-[var(--border-default)] bg-[var(--surface-shell)] shadow-sm",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type Props = PropsWithChildren<
  VariantProps<typeof panelVariants> & {
    className?: string;
  } & React.HTMLAttributes<HTMLDivElement>
>;

export function Panel({ children, className = "", variant, ...props }: Props) {
  return (
    <div className={panelVariants({ variant, className })} {...props}>
      {children}
    </div>
  );
}
