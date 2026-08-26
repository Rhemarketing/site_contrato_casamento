import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { PrismaUserRepository } from "@/repositories/prisma/prisma-user.repository";
import { authenticateCredentials } from "@/services/auth.service";

const userRepository = new PrismaUserRepository();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({ credentials: { email: {}, password: {} }, authorize: (credentials) => authenticateCredentials(credentials, userRepository) })],
});
