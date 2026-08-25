import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export function addUserRoleToToken(token: JWT, user?: User) {
  if (user) token.role = user.role;
  return token;
}

export function addTokenIdentityToSession(session: Session, token: JWT) {
  if (token.sub) session.user.id = token.sub;
  session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
  return session;
}
