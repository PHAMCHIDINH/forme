import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition-transform duration-150 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55 data-[pending=true]:cursor-progress data-[pending=true]:opacity-75",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-crisp-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[var(--primary-hover)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-crisp-sm)] hover:translate-x-[1px] hover:translate-y-[1px]",
        ghost: "bg-card text-foreground shadow-[var(--shadow-crisp-sm)]",
        scope: "justify-start bg-accent text-accent-foreground shadow-[var(--shadow-crisp-sm)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-crisp-sm)] hover:translate-x-[1px] hover:translate-y-[1px]",
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-11 px-4 text-sm",
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
