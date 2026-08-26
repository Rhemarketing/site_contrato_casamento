import type { UserRole } from "@/generated/prisma/client";
import { normalizeEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { UserRepository } from "@/repositories/user.repository";
import { loginSchema, registrationSchema } from "@/validations/auth";

export interface AuthenticatedUser { id: string; name: string; email: string; role: UserRole; }

export class EmailAlreadyRegisteredError extends Error {
  constructor() { super("Este e-mail já está cadastrado."); this.name = "EmailAlreadyRegisteredError"; }
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function toAuthenticatedUser(user: AuthenticatedUser): AuthenticatedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function registerUser(input: unknown, repository: UserRepository) {
  const raw = input as Record<string, unknown>;
  const data = registrationSchema.parse({
    name: raw?.name,
    email: raw?.email,
    password: raw?.password,
    passwordConfirmation: raw?.passwordConfirmation,
  });
  const email = normalizeEmail(data.email);
  if (await repository.findByEmail(email)) throw new EmailAlreadyRegisteredError();
  const passwordHash = await hashPassword(data.password);
  try {
    return toAuthenticatedUser(await repository.create({ name: data.name, email, passwordHash }));
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new EmailAlreadyRegisteredError();
    throw error;
  }
}

export async function authenticateCredentials(input: unknown, repository: UserRepository) {
  const raw = input as Record<string, unknown>;
  const parsed = loginSchema.safeParse({
    email: raw?.email,
    password: raw?.password,
  });
  if (!parsed.success) return null;
  const user = await repository.findByEmail(normalizeEmail(parsed.data.email));
  if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) return null;
  return toAuthenticatedUser(user);
}
