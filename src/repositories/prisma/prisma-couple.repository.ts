import "server-only";

import { db } from "@/lib/db";
import type { CoupleRepository } from "../couple.repository";

export class PrismaCoupleRepository implements CoupleRepository {
  findById(id: string) {
    return db.couple.findUnique({ where: { id } });
  }

  findByUserId(userId: string) {
    return db.couple.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
