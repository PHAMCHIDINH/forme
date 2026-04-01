import { Link, type LinkProps } from "react-router-dom";

type Props = LinkProps & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "desktop-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition";
  const variants = {
    primary: "desktop-button--primary",
    secondary: "desktop-button--secondary",
    ghost: "desktop-button--ghost",
  };

  return <Link className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />;
}
