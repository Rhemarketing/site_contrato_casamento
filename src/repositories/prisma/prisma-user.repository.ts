import "server-only";

import { db } from "@/lib/db";
import type { UserRepository } from "../user.repository";

export class PrismaUserRepository implements UserRepository {
  findById(id: string) {
    return db.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    return db.user.create({ data: { ...data, role: "USER" } });
  }
}
