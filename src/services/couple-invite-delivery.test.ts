import { describe, expect, it, vi } from "vitest";
import { CoupleInviteDeliveryService } from "./couple-invite-delivery.service";

const creator = { id: "user-1", name: "Pessoa <Segura>", email: "creator@example.test" };
const invite = { inviteUrl: "https://casamento.example.test/convite/token", expiresAt: "2026-09-04T12:00:00.000Z" };

describe("entrega do convite do casal", () => {
  it("envia o link produzido pelo serviço existente para o e-mail normalizado", async () => {
    const createInvite = vi.fn().mockResolvedValue(invite);
    const sendCoupleInvite = vi.fn().mockResolvedValue(undefined);
    const service = new CoupleInviteDeliveryService({ createInvite }, { sendCoupleInvite });
    expect(await service.createAndSend(creator, "  PARTNER@EXAMPLE.TEST  ")).toEqual({ ...invite, emailStatus: "SENT" });
    expect(createInvite).toHaveBeenCalledOnce();
    expect(sendCoupleInvite).toHaveBeenCalledWith("partner@example.test", creator.name, invite.inviteUrl);
  });

  it("falha de e-mail mantém um único convite criado e retorna estado controlado", async () => {
    const createInvite = vi.fn().mockResolvedValue(invite);
    const sendCoupleInvite = vi.fn().mockRejectedValue(new Error("SMTP secret"));
    const service = new CoupleInviteDeliveryService({ createInvite }, { sendCoupleInvite });
    expect(await service.createAndSend(creator, "partner@example.test")).toEqual({ ...invite, emailStatus: "FAILED" });
    expect(createInvite).toHaveBeenCalledOnce();
    expect(sendCoupleInvite).toHaveBeenCalledOnce();
  });
});
