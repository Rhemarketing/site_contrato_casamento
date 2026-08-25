import { z } from "zod";

const databaseUrlSchema = z.string().min(1).refine((value) => {
  try { return new URL(value).protocol === "mysql:"; } catch { return false; }
}, "DATABASE_URL deve ser uma URL MySQL/MariaDB válida.");

const authSecretSchema = z.string().min(32, "AUTH_SECRET deve possuir ao menos 32 caracteres.");

export function getDatabaseUrl() {
  return databaseUrlSchema.parse(process.env.DATABASE_URL);
}

export function getAuthSecret() {
  return authSecretSchema.parse(process.env.AUTH_SECRET);
}
