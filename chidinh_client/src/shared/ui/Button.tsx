import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70 data-[pending=true]:cursor-progress",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:opacity-90",
        secondary: "border border-border bg-surface text-text hover:bg-surfaceAlt",
        ghost: "text-text hover:bg-surfaceAlt",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    pending?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { asChild = false, className, pending = false, variant, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={buttonVariants({ variant, className })}
      data-pending={pending ? "true" : "false"}
      ref={ref}
      {...props}
    />
  );
});
