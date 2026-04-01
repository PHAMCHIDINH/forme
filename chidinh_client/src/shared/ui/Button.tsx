import { Link, type LinkProps } from "react-router-dom";

type Props = LinkProps & {
  variant?: "primary" | "secondary";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition";
  const variants = {
    primary: "bg-accent text-white hover:opacity-90",
    secondary: "border border-border bg-surface text-text hover:bg-surfaceAlt",
  };

  return <Link className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />;
}
