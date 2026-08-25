import { z } from "zod";

const databaseUrlSchema = z.string().min(1).refine((value) => {
  try { return new URL(value).protocol === "mysql:"; } catch { return false; }
}, "DATABASE_URL deve ser uma URL MySQL/MariaDB válida.");

export function getDatabaseUrl() {
  return databaseUrlSchema.parse(process.env.DATABASE_URL);
}
