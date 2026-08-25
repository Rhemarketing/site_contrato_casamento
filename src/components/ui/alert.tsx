import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "error";

const styles: Record<AlertVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  error: "border-red-200 bg-red-50 text-red-950",
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: AlertVariant;
}

export function Alert({ title, variant = "info", className, children, ...props }: AlertProps) {
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("rounded-xl border p-4", styles[variant], className)} {...props}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn("text-sm", title && "mt-1")}>{children}</div>
    </div>
  );
}
