// components/ui/Button.tsx
import { ButtonHTMLAttributes } from "react";
import Link, { LinkProps } from "next/link";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline:
    "btn-outline border-primary text-primary border-2 hover:bg-primary hover:text-white hover:text-primary-content  ",
  danger: "btn-error",
  ghost: "btn-ghost",
};

const sizeClass: Record<Size, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

type BaseProps = { variant?: Variant; size?: Size; className?: string };

// Versi <button> — buat action (submit, onClick, dll)
type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

// Versi <Link> — buat navigasi
type ButtonAsLink = BaseProps &
  LinkProps & { href: string; children?: React.ReactNode; className?: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  className = "",
  size = "md",
  ...props
}: ButtonProps) {
  const classes = `btn ${variantClass[variant]} ${sizeClass[size]} ${className}`;

  if ("href" in props && props.href) {
    return <Link className={classes} {...props} />;
  }

  return <button className={classes} {...(props as ButtonAsButton)} />;
}
