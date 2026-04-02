import { cva, type VariantProps } from "class-variance-authority";
import type { PropsWithChildren } from "react";

const panelVariants = cva("rounded-[28px] border shadow-panel", {
  variants: {
    variant: {
      default: "border-border bg-surface",
      muted: "border-border bg-surfaceAlt",
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
