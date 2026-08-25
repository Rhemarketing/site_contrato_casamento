import "server-only";

import { db } from "@/lib/db";
import type { QuestionnaireRepository } from "../questionnaire.repository";

export class PrismaQuestionnaireRepository implements QuestionnaireRepository {
  findById(id: string) {
    return db.questionnaire.findUnique({ where: { id } });
  }

  findByCodeAndVersion(code: string, version: string) {
    return db.questionnaire.findUnique({
      where: { code_version: { code, version } },
    });
  }
}
