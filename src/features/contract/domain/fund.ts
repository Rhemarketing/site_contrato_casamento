import { z } from "zod";
export const fundProposalSchema = z.object({ documentHash: z.string().regex(/^[a-f0-9]{64}$/), process: z.enum(["CONVERSA_GERAL", "REEQUILIBRIO_TEMPO", "REVISAO_ACORDO"]), reference: z.string().trim().min(1).max(160).refine(v => !/[{}<>\u0000-\u001f]/.test(v)),
  refusalOfAgreedProcess: z.literal(true), noLegitimateImpediment: z.literal(true), noExcludedContext: z.literal(true), voluntary: z.literal(true) }).strict();
export type FundEntry = z.infer<typeof fundProposalSchema> & { amountCents: 1000; currency: "BRL"; basisHash: string; hash: string; confirmations: { memberId: string; hash: string; at: string }[]; status: "PROPOSED" | "CONFIRMED" | "CONTESTED" };
