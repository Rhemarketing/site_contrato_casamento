"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();
  return <Button type="submit" fullWidth disabled={status.pending}>{status.pending ? pending : idle}</Button>;
}
