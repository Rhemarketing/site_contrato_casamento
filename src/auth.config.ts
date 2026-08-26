import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/config/env";
import { canAccessRoute, getRouteAccess } from "@/lib/auth/route-access";
import { addTokenIdentityToSession, addUserRoleToToken } from "@/lib/auth/session-callbacks";

export default {
  providers: [],
  pages: { signIn: "/login" },
  secret: getAuthSecret(),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) { return addUserRoleToToken(token, user); },
    session({ session, token }) { return addTokenIdentityToSession(session, token); },
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const access = getRouteAccess(pathname);
      if (canAccessRoute(pathname, auth?.user?.role)) return true;
      if (access === "admin" && auth?.user) return Response.redirect(new URL("/dashboard", request.nextUrl));
      const callbackUrl = `${pathname}${request.nextUrl.search}`;
      return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.nextUrl));
    },
  },
} satisfies NextAuthConfig;
