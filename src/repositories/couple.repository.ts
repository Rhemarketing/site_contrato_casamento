import type { Couple } from "@/generated/prisma/client";
import type { Repository } from "./contracts/repository";

export interface CoupleRepository extends Repository<Couple> {
  findByUserId(userId: string): Promise<Couple[]>;
}
