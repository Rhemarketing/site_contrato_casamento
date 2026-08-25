import type { User } from "@/generated/prisma/client";
import type { Repository } from "./contracts/repository";

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
}
