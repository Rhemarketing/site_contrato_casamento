"use client";

import { useEffect, useRef } from "react";
import { Alert } from "@/components/ui/alert";

export function FormError({ message }: { message?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (message) ref.current?.focus(); }, [message]);
  if (!message) return null;
  return <div ref={ref} tabIndex={-1}><Alert variant="error" className="mb-5">{message}</Alert></div>;
}
