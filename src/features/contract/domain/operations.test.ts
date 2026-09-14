// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { calendarOffset, cycleBounds, evaluateEvents, eventReminders, eventSchema, localDateTimeToInstant, percentOf, proportionalShares, type ContractEvent } from "./operations";
const topicId = randomUUID();
const event = (day: number, patch: Partial<ContractEvent> = {}): ContractEvent => ({ kind: "EVENT", id: randomUUID(), topicId, topic: "Assunto", at: `2026-05-${String(day).padStart(2, "0")}T12:00:00Z`, timeZone: "America/Sao_Paulo", type: "AFFECTION", outcome: "DECLINED", impediment: false, ...patch });
const now = "2026-07-01T00:00:00Z";
describe("eventos privados e calendário", () => {
  it("conta recusas consecutivas, sem cobrar, e impedimentos interrompem a série", () => {
    const first = event(1), second = event(2), third = event(3);
    expect(evaluateEvents([first], now)).toEqual([]);
    expect(evaluateEvents([first, { ...second, impediment: true }, third], now)).toEqual([]);
    expect(evaluateEvents([first, { ...second, outcome: "ACCEPTED" }, third], now)).toEqual([]);
    const tasks = evaluateEvents([third, first, second, third], now);
    expect(tasks).toHaveLength(1); expect(tasks[0]).toMatchObject({ protocol: "P02", dueAt: "2026-05-03T12:00:00.000Z", contributionAllowed: false, sourceEventIds: [first.id, second.id] });
  });
  it("usa dois ciclos completos adjacentes com a mesma frequência, sem outro relógio P07", () => {
    const cycle = { anchor: "2026-05-01T12:00:00Z", unit: "WEEK" as const, days: 7, index: 0, goal: 2, actual: 1, dissatisfied: true };
    const a = event(8, { type: "CYCLE", outcome: "COMPLETED", cycle });
    const b = event(15, { type: "CYCLE", outcome: "COMPLETED", cycle: { ...cycle, index: 1 } });
    expect(evaluateEvents([a, b], now)).toMatchObject([{ protocol: "P03", dueAt: "2026-05-18T12:00:00.000Z", reviewAt: "2026-06-14T12:00:00.000Z" }]);
    expect(evaluateEvents([a, { ...b, at: "2026-05-14T12:00:00Z" }], now)).toEqual([]);
    expect(evaluateEvents([a, { ...b, cycle: { ...b.cycle!, goal: 3 } }], now)).toEqual([]);
    expect(evaluateEvents([a, { ...b, impediment: true }], now)).toEqual([]);
    expect(cycleBounds({ ...cycle, unit: "MONTH", anchor: "2026-01-31T12:00:00Z" }, a.timeZone).end).toBe("2026-02-28T12:00:00.000Z");
  });
  it("a retomada sem solução passa a contar 72 horas da conversa e melhora encerra a pendência", () => {
    const issue = event(1, { type: "ISSUE", outcome: "SEM_MELHORA", safeToDiscuss: true });
    const conversation = event(2, { type: "CONVERSATION", outcome: "SEM_MELHORA", safeToDiscuss: true, action: "Retomar o assunto", reviewAt: "2026-05-10T12:00:00Z" });
    expect(evaluateEvents([issue, conversation], now)).toMatchObject([{ protocol: "P01", dueAt: "2026-05-05T12:00:00.000Z", sourceEventIds: [issue.id, conversation.id], reviewAt: conversation.reviewAt }]);
    expect(evaluateEvents([issue, { ...conversation, impediment: true }], now)[0].dueAt).toBe("2026-05-02T12:00:00.000Z");
    expect(evaluateEvents([issue, { ...conversation, outcome: "MELHOROU" }], now)).toEqual([]);
    expect(evaluateEvents([issue, { ...conversation, outcome: "MELHOROU" }, event(3, { ...issue, id: randomUUID(), at: "2026-05-03T12:00:00Z" })], now)).toMatchObject([{ protocol: "P01", reopened: true }]);
  });
  it("não conta a mesma ocorrência duas vezes e mantém os limiares próprios de padrão e renda", () => {
    const first = event(1), pattern = (day: number) => event(day, { type: "PATTERN", outcome: "SEM_MELHORA", safeToDiscuss: true });
    expect(evaluateEvents([first, first], now)).toEqual([]);
    expect(evaluateEvents([pattern(1), pattern(2)], now)).toEqual([]);
    expect(evaluateEvents([pattern(1), pattern(2), pattern(3)], now)).toMatchObject([{ protocol: "P01", dueAt: "2026-05-06T12:00:00.000Z" }]);
    const income = event(1, { type: "INCOME", outcome: "COMPLETED", income: { before: 1000, after: 1199 } });
    expect(eventReminders([income])).toEqual([]);
    expect(eventReminders([{ ...income, income: { before: 1000, after: 1200 } }])).toHaveLength(1);
    expect(eventReminders([event(1, { type: "QUALITY", outcome: "CANCELLED" })])).toMatchObject([{ at: "2026-05-08T12:00:00.000Z" }]);
  });
  it("regressão reabre o protocolo original e exige novo gatilho completo", () => {
    const review = event(3, { type: "REVIEW", protocol: "P02", outcome: "MELHOROU", action: "Retomar cuidado", reviewAt: "2026-06-01T12:00:00Z" });
    expect(evaluateEvents([event(1), event(2), review, event(4)], now)).toEqual([]);
    expect(evaluateEvents([event(1), event(2), review, event(4), event(5)], now)).toMatchObject([{ protocol: "P02", reopened: true }]);
  });
  it("impasse exige três conversas do mesmo assunto, em 90 dias, e parcial não é fracasso completo", () => {
    const conversation = (day: number, outcome: ContractEvent["outcome"] = "SEM_MELHORA") => event(day, { type: "CONVERSATION", outcome, action: "Ação concreta", reviewAt: "2026-06-30T12:00:00Z" });
    expect(evaluateEvents([conversation(1), conversation(2, "PARCIAL"), conversation(3)], now)).toEqual([]);
    expect(evaluateEvents([conversation(1), conversation(2), { ...conversation(3), topicId: randomUUID() }], now)).toEqual([]);
    expect(evaluateEvents([conversation(1), conversation(2), conversation(3)], now)).toMatchObject([{ protocol: "P11", contributionAllowed: false }]);
  });
  it("preserva o dia e horário local em meses e rejeita datas e horários inexistentes", () => {
    expect(localDateTimeToInstant("2026-10-01T09:00", "America/Sao_Paulo")).toBe("2026-10-01T12:00:00.000Z");
    expect(calendarOffset("2026-01-31T12:00:00Z", "America/Sao_Paulo", 2)).toBe("2026-03-31T12:00:00.000Z");
    expect(() => localDateTimeToInstant("2026-02-31T09:00", "America/Sao_Paulo")).toThrow();
    expect(() => localDateTimeToInstant("2026-03-08T02:30", "America/New_York")).toThrow();
    expect(eventSchema.safeParse(event(1, { reviewAt: "2020-01-01T00:00:00Z" })).success).toBe(false);
  });
  it("não divide por zero nem generaliza gatilhos financeiros", () => {
    expect(percentOf(0, 50)).toBe(0); expect(proportionalShares(0, 0)).toBeNull(); expect(proportionalShares(3000, 1000)).toEqual([0.75, 0.25]);
    const finance = { previousIncome: 1000, currentIncome: 801, reserveBefore: 1000, reserveUsed: 249, reserveAfter: 751, essentialMonthly: 500, unemployment: false, cannotPayEssential: false, extraordinaryCredit: false, workIncapacity: false };
    const e = event(1, { type: "FINANCE", outcome: "SEM_MELHORA", finance });
    expect(evaluateEvents([e], now)).toEqual([]);
    expect(evaluateEvents([{ ...e, finance: { ...finance, currentIncome: 800 } }], now)).toMatchObject([{ protocol: "P08" }]);
    expect(evaluateEvents([{ ...e, finance: { ...finance, reserveUsed: 250 } }], now)).toMatchObject([{ protocol: "P08" }]);
  });
});
