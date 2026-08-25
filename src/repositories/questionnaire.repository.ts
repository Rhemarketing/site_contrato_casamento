import type { Questionnaire } from "@/generated/prisma/client";
import type { Repository } from "./contracts/repository";

export interface QuestionnaireRepository extends Repository<Questionnaire> {
  findByCodeAndVersion(code: string, version: string): Promise<Questionnaire | null>;
}
