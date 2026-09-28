"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  showPasswordToggle?: boolean;
}

function EyeOpenIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function Input({
  id,
  label,
  error,
  hint,
  className,
  type,
  showPasswordToggle,
  ...props
}: InputProps) {
  const isPassword = type === "password";
  const hasToggle = isPassword && (showPasswordToggle ?? true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const effectiveType = hasToggle ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-semibold text-brand-strong" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={effectiveType}
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          className={cn(
            "min-h-12 w-full rounded-xl border bg-white px-4 text-foreground shadow-sm transition placeholder:text-muted/70",
            error ? "border-red-600" : "border-line hover:border-brand/60",
            hasToggle && "pr-11",
            className,
          )}
          {...props}
        />
        {hasToggle ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={isPasswordVisible ? "Ocultar senha" : "Exibir senha"}
            title={isPasswordVisible ? "Ocultar senha" : "Exibir senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-lg text-muted transition hover:text-brand-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
          >
            {isPasswordVisible ? (
              <EyeOpenIcon className="size-5" />
            ) : (
              <EyeClosedIcon className="size-5" />
            )}
          </button>
        ) : null}
      </div>
      {error ? <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">{error}</p> : null}
      {!error && hint ? <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
