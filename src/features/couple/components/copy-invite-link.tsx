"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyInviteLink({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
  }

  return (
    <Button type="button" variant="secondary" onClick={copy} aria-live="polite">
      {copied ? "Link copiado" : "Copiar link"}
    </Button>
  );
}
