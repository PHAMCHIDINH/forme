import * as RadixLabel from "@radix-ui/react-label";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

type LabelProps = ComponentPropsWithoutRef<typeof RadixLabel.Root>;

export const Label = forwardRef<ElementRef<typeof RadixLabel.Root>, LabelProps>(function Label(
  { className, ...props },
  ref,
) {
  return (
    <RadixLabel.Root
      className={["block text-sm font-medium text-foreground", className].filter(Boolean).join(" ")}
      ref={ref}
      {...props}
    />
  );
});
