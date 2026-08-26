import { z } from "zod";

const id = z.string().uuid();

export const saveAdmissionAnswerSchema = z.object({
  attemptId: id,
  questionId: id,
  optionId: id,
}).strict();

export const completeAdmissionAttemptSchema = z.object({ attemptId: id }).strict();
