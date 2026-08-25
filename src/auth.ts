import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
});
