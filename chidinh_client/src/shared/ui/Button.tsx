import { Link, type LinkProps } from "react-router-dom";
import type { ButtonHTMLAttributes } from "react";

type Props = {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
} & (
  | ({ to: string } & Omit<LinkProps, "className">)
  | ({ to?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base = "font-head transition-all rounded-none outline-none cursor-pointer duration-200 uppercase tracking-widest inline-flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed border-2 border-border px-6 py-3 text-sm";
  
  const variants = {
    primary:
      "shadow-md hover:shadow-sm active:shadow-none bg-primary text-primary-foreground hover:-translate-y-1 active:translate-y-1 active:translate-x-1 hover:bg-primary-hover",
    secondary:
      "shadow-md hover:shadow-sm active:shadow-none bg-card text-card-foreground hover:-translate-y-1 active:translate-y-1 active:translate-x-1 hover:bg-muted",
    ghost:
      "border-transparent bg-transparent hover:bg-muted hover:border-border",
  };

  const combinedClassName = `${base} ${variants[variant]} ${className}`.trim();

  if ("to" in props && props.to !== undefined) {
    return <Link className={combinedClassName} {...(props as any)} />;
  }

  return <button className={combinedClassName} {...(props as any)} />;
}
