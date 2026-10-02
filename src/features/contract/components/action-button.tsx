"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { ContractActionResult } from "@/app/actions/contract.actions";

export function ContractActionButton({
  action,
  children,
  disabled = false,
}: {
  action: () => Promise<ContractActionResult | void>;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  return (
    <div>
      <Button
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            try {
              const result = await action();
              if (result) {
                setMessage(result.message);
                if (result.ok) router.refresh();
              }
            } catch (error: unknown) {
              const digest = typeof error === "object" && error !== null && "digest" in error
                ? String((error as { digest: unknown }).digest)
                : "";
              if (digest.startsWith("NEXT_REDIRECT")) {
                throw error;
              }
              setMessage("Não foi possível registrar. Verifique sua conexão e tente novamente.");
            }
          })
        }
      >
        {pending ? "Registrando…" : children}
      </Button>
      {message ? <p role="status" className="mt-2 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
