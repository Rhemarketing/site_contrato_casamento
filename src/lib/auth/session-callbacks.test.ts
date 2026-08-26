import { describe, expect, it } from "vitest";
import authConfig from "@/auth.config";
import { addTokenIdentityToSession, addUserRoleToToken } from "./session-callbacks";

type AuthCallback = (params: Record<string, unknown>) => unknown;

describe("Auth.js session callbacks", () => {
  it("propaga id e role sem passwordHash", () => {
    const token = addUserRoleToToken({ sub: "user-id" }, { id: "user-id", name: "Pessoa", email: "pessoa@example.test", role: "ADMIN" });
    const session = addTokenIdentityToSession({ user: { name: "Pessoa", email: "pessoa@example.test", id: "", role: "USER" }, expires: new Date(Date.now() + 60_000).toISOString() }, token);
    expect(session.user.id).toBe("user-id");
    expect(session.user.role).toBe("ADMIN");
    expect(session.user).not.toHaveProperty("passwordHash");
  });

  it("compartilha os callbacks de JWT e sessão com o proxy", async () => {
    const jwtCallback = authConfig.callbacks?.jwt;
    const sessionCallback = authConfig.callbacks?.session;
    expect(jwtCallback).toBeTypeOf("function");
    expect(sessionCallback).toBeTypeOf("function");

    const token = await (jwtCallback as unknown as AuthCallback)({
      token: { sub: "proxy-user-id" },
      user: { id: "proxy-user-id", role: "USER" },
    });
    const session = await (sessionCallback as unknown as AuthCallback)({
      session: { user: {}, expires: new Date(Date.now() + 60_000).toISOString() },
      token,
    });

    expect(session).toMatchObject({ user: { id: "proxy-user-id", role: "USER" } });
  });
});
