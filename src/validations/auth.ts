import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

export const registrationSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Informe seu nome."),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas precisam ser iguais.",
  path: ["passwordConfirmation"],
});
