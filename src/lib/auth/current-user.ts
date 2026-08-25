import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSafeCallbackUrl } from "./callback-url";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser(callbackUrl = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(getSafeCallbackUrl(callbackUrl))}`);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
