import { z } from "zod";

export const passwordSchema = z.string()
  .min(12, "A senha deve ter ao menos 12 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.");

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
}).strict();

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120, "O nome deve ter no máximo 120 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: passwordSchema,
  passwordConfirmation: z.string(),
}).strict().refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas precisam ser iguais.",
  path: ["passwordConfirmation"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
}).strict();

export const passwordResetSubmissionSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Este link de redefinição não é válido."),
  password: passwordSchema,
  passwordConfirmation: z.string(),
}).strict().refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas precisam ser iguais.",
  path: ["passwordConfirmation"],
});
