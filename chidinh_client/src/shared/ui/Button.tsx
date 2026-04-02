import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-panel)] px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55 data-[pending=true]:cursor-progress data-[pending=true]:opacity-75",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--border-strong)] bg-primary text-primary-foreground shadow-sm hover:bg-[#284c50] hover:shadow-md active:translate-y-px active:shadow-none",
        secondary:
          "bg-[var(--surface-panel)] text-foreground hover:border-[var(--border-strong)] hover:bg-[var(--surface-panel-featured)]",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-[var(--surface-panel-muted)]",
        scope:
          "min-w-0 justify-start border-[var(--border-subtle)] bg-[var(--surface-panel)] text-muted-foreground hover:border-[var(--border-strong)] hover:text-foreground data-[selected=true]:border-[var(--border-strong)] data-[selected=true]:bg-[var(--surface-panel-featured)] data-[selected=true]:text-foreground data-[selected=true]:shadow-sm",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    pending?: boolean;
    selected?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { asChild = false, className, pending = false, selected = false, size, variant, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={buttonVariants({ variant, size, className })}
      data-pending={pending ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      ref={ref}
      {...props}
    />
  );
});
