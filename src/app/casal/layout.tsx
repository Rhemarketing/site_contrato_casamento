import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/current-user";

export default async function CoupleLayout({ children }: { children: ReactNode }) {
  await requireUser("/casal");
  return children;
}
