import { z } from "zod";

const databaseUrlSchema = z.string().min(1).refine((value) => {
  try { return new URL(value).protocol === "mysql:"; } catch { return false; }
}, "DATABASE_URL deve ser uma URL MySQL/MariaDB válida.");

const authSecretSchema = z.string().min(32, "AUTH_SECRET deve possuir ao menos 32 caracteres.");
const appUrlSchema = z.url("APP_URL deve ser uma URL absoluta válida.").refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" ||
    (url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname));
}, "APP_URL deve usar HTTPS fora do ambiente local.").transform((value) => value.replace(/\/$/, ""));

const smtpConfigSchema = z.object({
  host: z.string().trim().min(1, "SMTP_HOST é obrigatório."),
  port: z.coerce.number().int().min(1).max(65_535),
  user: z.string().min(1, "SMTP_USER é obrigatório."),
  password: z.string().min(1, "SMTP_PASSWORD é obrigatório."),
  from: z.string().trim().min(3, "SMTP_FROM é obrigatório."),
}).strict();

export function getDatabaseUrl() {
  return databaseUrlSchema.parse(process.env.DATABASE_URL);
}

export function getAuthSecret() {
  return authSecretSchema.parse(process.env.AUTH_SECRET);
}

export function getAppUrl() {
  return appUrlSchema.parse(process.env.APP_URL ?? process.env.AUTH_URL);
}

export function getSmtpConfig() {
  return smtpConfigSchema.parse({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  });
}
