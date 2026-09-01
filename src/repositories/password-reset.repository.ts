export type PasswordResetTokenState = "VALID" | "INVALID" | "EXPIRED" | "USED";
export type PasswordResetConsumeResult = PasswordResetTokenState | "SUCCESS";

export interface PasswordResetRepository {
  findUserByEmail(email: string): Promise<{ id: string; email: string } | null>;
  replacePendingToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    now: Date;
  }): Promise<void>;
  getTokenState(tokenHash: string, now: Date): Promise<PasswordResetTokenState>;
  consumeToken(input: {
    tokenHash: string;
    passwordHash: string;
    now: Date;
  }): Promise<PasswordResetConsumeResult>;
}
