// Brazilian mobile numbers are stored with country code; formatting is UI only.
export function formatWhatsAppPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!digits) return "";
  if (digits.length < 3) return `(${digits}`;
  const local = digits.slice(2);
  return `(${digits.slice(0, 2)}) ${local.slice(0, 5)}${local.length > 5 ? `-${local.slice(5)}` : ""}`;
}

export function normalizeWhatsAppPhone(value: string): string | null {
  if (/[^\d\s()+-]/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) digits = digits.slice(2);
  if (!/^[1-9]\d9\d{8}$/.test(digits)) return null;
  return `55${digits}`;
}

export function whatsAppInviteUrl(phone: string, inviteUrl: string): string {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) throw new Error("INVALID_WHATSAPP_PHONE");
  const url = new URL(inviteUrl);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("INVALID_INVITE_URL");
  const message = `Quero convidar você para conectar nossas contas no Contrato de Casamento. Acesse o convite: ${url.href}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
