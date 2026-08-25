import "server-only";

import { db } from "@/lib/db";
import type { QuestionnaireAttemptRepository } from "../questionnaire-attempt.repository";

export class PrismaQuestionnaireAttemptRepository implements QuestionnaireAttemptRepository {
  findById(id: string) {
    return db.questionnaireAttempt.findUnique({ where: { id } });
  }

  findByIdForUser(id: string, userId: string) {
    return db.questionnaireAttempt.findFirst({ where: { id, userId } });
  }
}
