import { normalizeEmail } from "@/lib/email";
import type { CreatedCoupleInviteDto } from "@/types/couple";
import type { EmailService } from "./email.service";

type InviteCreator = { id: string; name: string; email: string };
type InviteIssuer = {
  createInvite(user: { id: string; email: string }, recipientEmail: string): Promise<CreatedCoupleInviteDto>;
};

export type DeliveredCoupleInviteDto = CreatedCoupleInviteDto & {
  emailStatus: "SENT" | "FAILED";
};

export class CoupleInviteDeliveryService {
  constructor(
    private readonly inviteService: InviteIssuer,
    private readonly emailService: Pick<EmailService, "sendCoupleInvite">,
  ) {}

  async createAndSend(creator: InviteCreator, recipientEmail: string): Promise<DeliveredCoupleInviteDto> {
    const invite = await this.inviteService.createInvite(creator, recipientEmail);
    try {
      await this.emailService.sendCoupleInvite(
        normalizeEmail(recipientEmail),
        creator.name,
        invite.inviteUrl,
      );
      return { ...invite, emailStatus: "SENT" };
    } catch {
      return { ...invite, emailStatus: "FAILED" };
    }
  }
}
