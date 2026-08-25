import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/config/env";
import { canAccessRoute, getRouteAccess } from "@/lib/auth/route-access";

export default {
  providers: [],
  pages: { signIn: "/login" },
  secret: getAuthSecret(),
  session: { strategy: "jwt" },
  callbacks: {
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
