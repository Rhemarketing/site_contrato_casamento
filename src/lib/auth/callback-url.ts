export function getSafeCallbackUrl(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback;
  try {
    const base = new URL("https://internal.invalid");
    const target = new URL(value, base);
    if (target.origin !== base.origin || !value.startsWith("/") || value.startsWith("//")) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch { return fallback; }
}
