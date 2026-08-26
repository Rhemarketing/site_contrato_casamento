export type CoupleOverviewDto =
  | { state: "NONE" }
  | {
      state: "PENDING";
      role: "CREATOR";
      invite: {
        email: string;
        status: "PENDING";
        expiresAt: string;
      } | null;
    }
  | {
      state: "ACTIVE";
      role: "CREATOR" | "PARTNER";
      partner: { name: string; email: string };
      joinedAt: string;
    };

export type CoupleInvitePreviewDto =
  | {
      state: "AVAILABLE";
      creatorName: string;
      recipientEmail: string;
      expiresAt: string;
    }
  | { state: "EXPIRED" }
  | { state: "CANCELLED" }
  | { state: "ACCEPTED" }
  | { state: "UNAVAILABLE" };

export type CreatedCoupleInviteDto = {
  inviteUrl: string;
  expiresAt: string;
};
