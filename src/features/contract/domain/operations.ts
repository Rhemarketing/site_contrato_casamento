import { z } from "zod";
export const TIME_ZONE = "America/Sao_Paulo";
export const timeZoneSchema = z.string().max(80).refine(value => { try { new Intl.DateTimeFormat("pt-BR", { timeZone: value }).format(); return true; } catch { return false; } });
const short = z.string().trim().min(1).max(300).refine(v => !/[{}<>\u0000-\u001f]/.test(v));
const instant = z.iso.datetime({ offset: true });
const nonnegative = z.number().finite().nonnegative().max(1000000000);
export const PROTOCOLS = {
  P01: "Conversa, escuta e correção", P02: "Conversa de reconexão", P03: "Frequência íntima e retomada", P04: "Momento de reconexão", P05: "Reconstrução da confiança", P06: "Reequilíbrio do tempo", P08: "Crise financeira", P09: "Divergência reprodutiva", P10: "Proteção e recuperação de hábitos", P11: "Impasse", P13: "Cuidado e segurança", P14: "Calendário de revisões",
} as const;
export const eventSchema = z.object({
  kind: z.literal("EVENT"), id: z.uuid(), topicId: z.uuid(), topic: short, at: instant, timeZone: timeZoneSchema,
  type: z.enum(["ISSUE", "PATTERN", "AFFECTION", "CYCLE", "QUALITY", "FINANCE", "INCOME", "CONVERSATION", "TRUST", "HABIT", "REVIEW"]),
  impediment: z.boolean(), outcome: z.enum(["DECLINED", "ACCEPTED", "CANCELLED", "COMPLETED", "MELHOROU", "PARCIAL", "SEM_MELHORA"]),
  protocol: z.enum(["P01", "P02", "P03", "P05", "P06", "P08", "P10", "P11"]).optional(),
  avoidable: z.boolean().optional(), rescheduled: z.boolean().optional(),
  cycle: z.object({ anchor: instant, unit: z.enum(["WEEK", "FORTNIGHT", "MONTH", "DAYS", "NONE"]), days: z.number().int().min(1).max(365), index: z.number().int().nonnegative().max(10000), goal: z.number().int().min(0).max(100), actual: z.number().int().min(0).max(100), dissatisfied: z.boolean() }).strict().optional(),
  finance: z.object({ previousIncome: nonnegative, currentIncome: nonnegative, reserveBefore: nonnegative, reserveUsed: nonnegative, reserveAfter: nonnegative, essentialMonthly: nonnegative, unemployment: z.boolean(), cannotPayEssential: z.boolean(), extraordinaryCredit: z.boolean(), workIncapacity: z.boolean() }).strict().optional(),
  income: z.object({ before: nonnegative, after: nonnegative }).strict().optional(),
  action: short.optional(), reviewAt: instant.optional(), safeToDiscuss: z.boolean().optional(), knownToBoth: z.boolean().optional(),
}).strict().superRefine((value, ctx) => {
  const validOutcomes: Record<string, string[]> = { ISSUE: ["SEM_MELHORA"], PATTERN: ["SEM_MELHORA"], AFFECTION: ["DECLINED", "ACCEPTED"], CYCLE: ["COMPLETED"], QUALITY: ["CANCELLED", "COMPLETED"], FINANCE: ["SEM_MELHORA"], INCOME: ["COMPLETED"], CONVERSATION: ["MELHOROU", "PARCIAL", "SEM_MELHORA"], TRUST: ["SEM_MELHORA"], HABIT: ["SEM_MELHORA"], REVIEW: ["MELHOROU", "PARCIAL", "SEM_MELHORA"] };
  if (!validOutcomes[value.type].includes(value.outcome)) ctx.addIssue({ code: "custom", message: "Resultado incompatível com o evento" });
  if (value.type === "CYCLE" && !value.cycle || value.type === "FINANCE" && !value.finance || value.type === "REVIEW" && !value.protocol) ctx.addIssue({ code: "custom", message: "Dados do evento incompletos" });
  if (["CONVERSATION", "REVIEW"].includes(value.type) && (!value.action || !value.reviewAt)) ctx.addIssue({ code: "custom", message: "Registre ação e data de revisão" });
  if (value.reviewAt && Date.parse(value.reviewAt) <= Date.parse(value.at)) ctx.addIssue({ code: "custom", message: "A revisão deve ser posterior à ocorrência" });
  if (value.cycle?.unit === "NONE" && value.cycle.goal !== 0) ctx.addIssue({ code: "custom", message: "Sem meta numérica exige meta zero" });
  if (value.type === "INCOME" && !value.income) ctx.addIssue({ code: "custom", message: "Informe as duas bases de renda individual" });
});
export type ContractEvent = z.infer<typeof eventSchema>;
export const emergencySchema = z.object({ kind: z.literal("EMERGENCY"), fields: z.record(z.enum(["contactName", "contactPhone", "careInstructions", "assistance"]), z.object({ value: short, shared: z.boolean() }).strict()) }).strict();
export const EMERGENCY_FIELDS = { contactName: "Contato para emergência", contactPhone: "Telefone para emergência", careInstructions: "Informação indispensável para auxílio", assistance: "Como acessar o apoio necessário" } as const;
export const planSchema = z.object({ kind: z.literal("PLAN"), intensity: z.enum(["LIGHT", "MODERATE", "FULL"]), priorities: z.array(short).max(3), secondary: z.array(short).max(3), reviewAt: instant }).strict();
export const timingSchema = z.object({ kind: z.literal("TIMING"), anchor: instant, timeZone: timeZoneSchema }).strict();
export const ownRecordSchema = z.union([eventSchema, emergencySchema, planSchema, timingSchema]);
export type OwnRecord = z.infer<typeof ownRecordSchema>;
export const PLAN_LIMITS = { LIGHT: 1, MODERATE: 2, FULL: 3 } as const;
export function percentOf(income: number, percent: number) { if (!Number.isFinite(income) || income < 0 || !Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error("INVALID_FINANCIAL_BASE"); return Math.round(income * percent) / 100; }
export function proportionalShares(a: number, b: number): [number, number] | null { if (a < 0 || b < 0 || !Number.isFinite(a + b)) throw new Error("INVALID_FINANCIAL_BASE"); return a + b === 0 ? null : [a / (a + b), b / (a + b)]; }
const HOUR = 3600000, DAY = 24 * HOUR;
export function localParts(instant: string, timeZone: string) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(instant)).filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
}
function wallToInstant(parts: number[], zone: string) {
  const target = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  let guess = target;
  for (let i = 0; i < 5; i++) {
    const p = localParts(new Date(guess).toISOString(), zone);
    const local = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    if (local === target) return new Date(guess).toISOString();
    guess += target - local;
  }
  // A nonexistent DST wall time is not silently assigned to another hour.
  throw new Error("CALENDAR_TIME_UNAVAILABLE");
}
export function localDateTimeToInstant(value: string, zone: string) {
  timeZoneSchema.parse(zone);
  if (!/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)) throw new Error("INVALID_LOCAL_DATE");
  const parts = value.split(/[-T:]/).map(Number).concat(value.length === 16 ? [0] : []);
  const check = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
  if (check.getUTCFullYear() !== parts[0] || check.getUTCMonth() + 1 !== parts[1] || check.getUTCDate() !== parts[2] || parts[3] > 23 || parts[4] > 59 || parts[5] > 59) throw new Error("INVALID_LOCAL_DATE");
  return wallToInstant(parts, zone);
}
export function calendarOffset(anchor: string, zone: string, months: number, days = 0) {
  const p = localParts(anchor, zone);
  const month = new Date(Date.UTC(p.year, p.month - 1 + months, 1));
  const last = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const day = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), Math.min(p.day, last) + days));
  return wallToInstant([day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), p.hour, p.minute, p.second], zone);
}
export function cycleBounds(cycle: NonNullable<ContractEvent["cycle"]>, zone: string) {
  const length = cycle.unit === "WEEK" ? 7 : cycle.unit === "FORTNIGHT" ? 15 : cycle.unit === "NONE" ? 30 : cycle.days;
  const start = calendarOffset(cycle.anchor, zone, cycle.unit === "MONTH" ? cycle.index : 0, cycle.unit === "MONTH" ? 0 : cycle.index * length);
  const end = calendarOffset(cycle.anchor, zone, cycle.unit === "MONTH" ? cycle.index + 1 : 0, cycle.unit === "MONTH" ? 0 : (cycle.index + 1) * length);
  return { start, end };
}
export type ProtocolTask = { key: string; protocol: keyof typeof PROTOCOLS; topic: string; dueAt: string | null; reviewAt: string | null; sourceEventIds: string[]; reopened: boolean; contributionAllowed: false };
export function evaluateEvents(input: ContractEvent[], now: string): ProtocolTask[] {
  const events = [...new Map(input.map(e => [e.id, e])).values()].filter(e => Date.parse(e.at) <= Date.parse(now)).sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id));
  const tasks = new Map<string, ProtocolTask>(), closed = new Set<string>();
  const since = new Map<string, number>();
  for (const [eventIndex, event] of events.entries()) {
    const set = (protocol: ProtocolTask["protocol"], hours: number | null, sources: ContractEvent[] = [event], reviewDays: number | null = null) => {
      const key = `${protocol}:${event.topicId}`;
      if (tasks.has(key)) return;
      tasks.set(key, { key, protocol, topic: event.topic, dueAt: hours === null ? null : new Date(Date.parse(event.at) + hours * HOUR).toISOString(), reviewAt: reviewDays ? calendarOffset(event.at, event.timeZone, 0, reviewDays) : null, sourceEventIds: sources.map(e => e.id), reopened: closed.has(key), contributionAllowed: false });
    };
    const recent = (type: ContractEvent["type"], protocol: string) => events.slice(0, eventIndex + 1).filter(e => e.topicId === event.topicId && e.type === type && Date.parse(e.at) > (since.get(`${protocol}:${event.topicId}`) ?? 0));
    if (event.type === "REVIEW" && event.protocol) {
      const key = `${event.protocol}:${event.topicId}`;
      if (event.outcome === "MELHOROU") { tasks.delete(key); closed.add(key); since.set(key, Date.parse(event.at)); }
      else { const task = tasks.get(key); if (task && event.reviewAt) task.reviewAt = event.reviewAt; }
      continue;
    }
    if (event.type === "ISSUE" && event.safeToDiscuss === true) set("P01", 24);
    if (event.type === "PATTERN" && event.safeToDiscuss === true) {
      const repeated = recent("PATTERN", "P01").filter(e => Date.parse(e.at) >= Date.parse(event.at) - 30 * DAY && !e.impediment).slice(-3);
      if (repeated.length === 3) set("P01", 72, repeated);
    }
    if (event.type === "AFFECTION") {
      const pair = recent("AFFECTION", "P02").slice(-2);
      if (pair.length === 2 && pair.every(e => e.outcome === "DECLINED" && !e.impediment)) set("P02", 24, pair);
    }
    if (event.type === "CYCLE" && event.cycle && !event.impediment) {
      const current = event.cycle;
      if (Date.parse(cycleBounds(current, event.timeZone).end) > Date.parse(event.at)) continue;
      if (current.unit === "NONE" && current.actual === 0 && current.dissatisfied) set("P03", 72, [event], 30);
      else if (current.unit !== "NONE" && current.actual < current.goal) {
        const previous = recent("CYCLE", "P03").find(e => e.cycle && e.id !== event.id && e.cycle.anchor === current.anchor && e.cycle.unit === current.unit && e.cycle.days === current.days && e.cycle.goal === current.goal && e.cycle.index === current.index - 1 && !e.impediment && e.cycle.actual < e.cycle.goal && Date.parse(cycleBounds(e.cycle, e.timeZone).end) <= Date.parse(e.at));
        if (previous) set("P03", 72, [previous, event], 30);
      }
    }
    if (event.type === "QUALITY") {
      const pair = recent("QUALITY", "P06").slice(-2);
      if (pair.length === 2 && pair.every(e => e.outcome === "CANCELLED" && e.avoidable && !e.rescheduled && !e.impediment)) set("P06", 72, pair);
    }
    if (event.type === "FINANCE" && event.finance) {
      const f = event.finance;
      const reduction = f.previousIncome > 0 && f.currentIncome <= f.previousIncome * 0.8;
      if (f.unemployment || f.cannotPayEssential || f.extraordinaryCredit || f.workIncapacity || reduction || f.reserveBefore > 0 && f.reserveUsed >= f.reserveBefore * 0.25 || f.essentialMonthly > 0 && f.reserveAfter < f.essentialMonthly) set("P08", 72, [event], 30);
    }
    if (event.type === "CONVERSATION") {
      const series = recent("CONVERSATION", "P11").filter(e => Date.parse(e.at) >= Date.parse(event.at) - 90 * DAY).slice(-3);
      if (series.length === 3 && series.every(e => e.outcome === "SEM_MELHORA" && !e.impediment)) set("P11", null);
      const key = `P01:${event.topicId}`;
      if (event.outcome === "MELHOROU") { tasks.delete(key); closed.add(key); since.set(key, Date.parse(event.at)); }
      if (event.outcome === "SEM_MELHORA" && event.safeToDiscuss === true && !event.impediment) {
        const pending = tasks.get(key);
        if (pending) {
          pending.dueAt = new Date(Date.parse(event.at) + 72 * HOUR).toISOString();
          pending.reviewAt = event.reviewAt ?? pending.reviewAt;
          pending.sourceEventIds = [...new Set([...pending.sourceEventIds, event.id])];
        } else set("P01", 72);
      }
    }
    if (event.type === "TRUST" && event.knownToBoth && event.safeToDiscuss && !event.impediment) set("P05", null, [event], 30);
    if (event.type === "HABIT") set("P10", null, [event], 30);
  }
  return [...tasks.values()];
}
export function eventReminders(events: ContractEvent[]) {
  return events.flatMap(event => {
    if (event.type === "QUALITY" && event.outcome === "CANCELLED" && !event.rescheduled && !event.impediment) return [{ id: event.id, title: `Remarcar momento de qualidade: ${event.topic}`, at: calendarOffset(event.at, event.timeZone, 0, 7) }];
    if (event.type === "INCOME" && event.income && (event.income.before > 0 ? Math.abs(event.income.after - event.income.before) >= event.income.before * 0.2 : event.income.after > 0)) return [{ id: event.id, title: `Rever contribuição comum após alteração da renda individual: ${event.topic}`, at: event.at }];
    return [];
  });
}
