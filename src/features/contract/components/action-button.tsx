"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { ContractActionResult } from "@/app/actions/contract.actions";

export function ContractActionButton({ action, children, disabled = false }: { action: () => Promise<ContractActionResult>; children: React.ReactNode; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  return <div><Button disabled={disabled || pending} onClick={() => start(async () => {
    try { const result = await action(); setMessage(result.message); if (result.ok) router.refresh(); }
    catch { setMessage("Não foi possível registrar. Verifique sua conexão e tente novamente."); }
  })}>{pending ? "Registrando…" : children}</Button><p role="status" className="mt-2 text-sm text-muted">{message}</p></div>;
}
