import type { QuestionnaireAttempt } from "@/generated/prisma/client";
import type { Repository } from "./contracts/repository";

export interface QuestionnaireAttemptRepository extends Repository<QuestionnaireAttempt> {
  findByIdForUser(id: string, userId: string): Promise<QuestionnaireAttempt | null>;
}
