import "server-only";

import { db } from "@/lib/db";
import { PrismaPasswordResetRepository } from "@/repositories/prisma/prisma-password-reset.repository";
import { createEmailService } from "./email.service";
import { PasswordResetService } from "./password-reset.service";

export function createPasswordResetService() {
  return new PasswordResetService(
    new PrismaPasswordResetRepository(db),
    createEmailService(),
  );
}
