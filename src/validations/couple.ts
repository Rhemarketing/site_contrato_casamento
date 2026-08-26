import { z } from "zod";

export const createCoupleInviteSchema = z.object({
  email: z.email("Informe um e-mail válido.").max(191, "O e-mail é muito longo."),
});

export const coupleInviteTokenSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Convite inválido."),
});
