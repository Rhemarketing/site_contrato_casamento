import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong disabled:bg-brand/50",
  secondary: "border border-line bg-surface text-brand hover:border-brand disabled:text-muted",
  ghost: "text-brand hover:bg-brand/5 disabled:text-muted",
  danger: "bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300",
};

export function Button({ className, variant = "primary", fullWidth = false, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
