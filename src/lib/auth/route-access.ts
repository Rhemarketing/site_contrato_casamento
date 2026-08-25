import type { UserRole } from "@/generated/prisma/client";

const authenticatedPrefixes = ["/dashboard", "/admissao/questionario", "/admissao/resultado", "/casal"];
export type RouteAccess = "public" | "authenticated" | "admin";

export function getRouteAccess(pathname: string): RouteAccess {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (authenticatedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return "authenticated";
  return "public";
}

export function canAccessRoute(pathname: string, role?: UserRole) {
  const access = getRouteAccess(pathname);
  if (access === "public") return true;
  if (!role) return false;
  return access !== "admin" || role === "ADMIN";
}
