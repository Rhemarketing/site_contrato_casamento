import { describe, expect, it } from "vitest";
import { addTokenIdentityToSession, addUserRoleToToken } from "./session-callbacks";

describe("Auth.js session callbacks", () => {
  it("propaga id e role sem passwordHash", () => {
    const token = addUserRoleToToken({ sub: "user-id" }, { id: "user-id", name: "Pessoa", email: "pessoa@example.test", role: "ADMIN" });
    const session = addTokenIdentityToSession({ user: { name: "Pessoa", email: "pessoa@example.test", id: "", role: "USER" }, expires: new Date(Date.now() + 60_000).toISOString() }, token);
    expect(session.user.id).toBe("user-id");
    expect(session.user.role).toBe("ADMIN");
    expect(session.user).not.toHaveProperty("passwordHash");
  });
});
