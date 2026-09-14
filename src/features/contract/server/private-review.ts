import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionData } from "../domain/types";
import { contentHash, unseal } from "./privacy";

export type ReviewSnapshot = { sessionId: string; answers: SessionData["answers"]; privateAnswers: SessionData["privateAnswers"]; context: SessionData["context"]; neckCompressionReport: boolean | null; q181Requested: boolean; q151Requested?: boolean; outcome?: "CONTINUE" | "PAUSE" | "CLOSE" };
export function reviewBasis(data: SessionData) {
  // Q181 itself can be answered after clearance; all other responses invalidate the review.
  const answers = { ...data.answers }; delete answers.Q181;
  return contentHash({ answers, privateAnswers: data.privateAnswers, context: data.context, neckCompressionReport: data.neckCompressionReport });
}
export function configuredReviewers() { return (process.env.CONTRACT_REVIEWER_USER_IDS ?? "").split(",").map(v => v.trim()).filter(v => /^[a-f0-9-]{36}$/i.test(v)); }
export async function withPrivateClearance(tx: Prisma.TransactionClient, session: { id: string; workspaceId: string; userId: string; payload: string }): Promise<SessionData> {
  const data = unseal<SessionData>(session.payload, `${session.id}:${session.userId}`);
  delete data.privateClearance;
  const review = await tx.contractPrivateReview.findFirst({ where: { workspaceId: session.workspaceId, ownerId: session.userId, basisHash: reviewBasis(data), status: "CONTINUE", revokedAt: null, reviewerId: { in: configuredReviewers() } }, orderBy: { decidedAt: "desc" } });
  if (review) {
    const payload = unseal<ReviewSnapshot>(review.payload, `review:${review.id}:${review.ownerId}:${review.reviewerId}`);
    if (payload.sessionId === session.id && payload.outcome === "CONTINUE") data.privateClearance = { q181: payload.q181Requested, q151: payload.q151Requested === true, safety: true, reviewId: review.id };
  }
  return data;
}
export function sessionPayload(data: SessionData) {
  const copy = { ...data }; delete copy.privateClearance; return copy;
}
