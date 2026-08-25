import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ id, label, error, hint, className, ...props }: InputProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-semibold text-brand-strong" htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-12 w-full rounded-xl border bg-white px-4 text-foreground shadow-sm transition placeholder:text-muted/70",
          error ? "border-red-600" : "border-line hover:border-brand/60",
          className,
        )}
        {...props}
      />
      {error ? <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">{error}</p> : null}
      {!error && hint ? <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
