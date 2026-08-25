import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-surface p-6 shadow-[0_12px_35px_rgba(25,45,56,0.06)]", className)} {...props} />;
}
