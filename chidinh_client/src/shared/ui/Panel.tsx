import { cva, type VariantProps } from "class-variance-authority";
import type { PropsWithChildren } from "react";

const panelVariants = cva("rounded-[var(--radius-lg)] border-2 shadow-[var(--shadow-crisp-md)]", {
  variants: {
    variant: {
      default: "border-[var(--border)] bg-[var(--surface-panel)] text-card-foreground",
      muted: "border-[var(--border)] bg-secondary text-secondary-foreground",
      featured: "border-[var(--border)] bg-[var(--surface-panel-featured)] text-accent-foreground",
      shell: "border-[var(--border)] bg-[var(--surface-shell)] text-foreground",
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
