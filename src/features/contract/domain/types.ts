export type Letter = "A" | "B" | "C";
export type PairKey = "AA" | "AB" | "AC" | "BB" | "BC" | "CC";
export type Facts = Record<string, boolean | null>;
export type Predicate =
  | { op: "literal"; value: boolean }
  | { op: "fact"; name: string }
  | { op: "any_answer"; codes: Letter[] }
  | { op: "not"; item: Predicate }
  | { op: "all" | "any"; items: Predicate[] };
export type Privacy = "COMMON" | "PRIVATE" | "SAFETY_PRIVATE";
export type ApplicabilityRule =
  | { always: true }
  | { context_equals: Record<string, boolean>; requires_private_review?: "Q181_SAFE_APPROACH" };
export type ContextDefinition = { label: string; help: string };
export type Question = {
  id: string; title: string; prompt: string; order: number;
  applicability: ApplicabilityRule | null;
  applicabilityDecision?: { version: string; rationale: string };
  period: string; clauseId: string | null; proposedClauseId: string | null;
  options: { code: Letter; text: string; privacy: Privacy; componentId: string }[];
  source: unknown;
};
export type Component = {
  id: string; questionId: string; privacy: Privacy; target: string;
  template: string | null; editorialTemplate: string | null;
  editorialFinal: boolean; active: boolean; version: string; source: unknown;
};
export type PairRule = {
  id: string; questionId: string; key: PairKey; action: string;
  privacy: Privacy; target: string; componentId: string | null;
  fixedComponentIds: string[]; moduleIds: string[]; privateModuleIds: string[];
  protocolIds: string[]; eventRuleIds: string[]; dependencies: string[];
  steps: { operation: string; when: Predicate; condition_id?: string; module_ids?: string[]; protocol_id?: string; scope?: string }[];
  active: boolean; jointBlocked: boolean; source: unknown;
};
export type JointModule = {
  id: string; questionId: string; title: string; prompt: string | null;
  predicate: Predicate | null; status: string; compiled: boolean;
  options: { code: Letter; text: string; template: string; fields: string[] }[];
  fixedTexts: string[];
  fieldDefinitions?: Record<string, DecisionField>;
  optionBindings?: Partial<Record<Letter, Record<string, string>>>;
  recordOnlyOptions?: Letter[];
  templateVariants?: { choice: Letter; field: string; value: string; template: string }[];
  repeatable?: boolean;
  operational?: boolean;
  reusedByQuestions: string[];
  source: unknown; version: string;
};
export type DecisionColumn = { label: string; type: "text" | "date" | "time" | "money" | "percent" | "member" | "number"; options?: string[] };
export type DecisionField = Omit<DecisionColumn, "type"> & { type: DecisionColumn["type"] | "table" | "selection" | "amountOrPercent"; columns?: DecisionColumn[]; maxRows?: number; optional?: boolean; emptyText?: string; help?: string; when?: { field: string; value: string } };
export type Catalog = {
  version: string; sourceHash: string; productionReady: boolean;
  applicabilityPolicy?: { version: string; hash: string };
  contextDefinitions?: Record<string, ContextDefinition>;
  questions: Question[]; rules: PairRule[]; components: Component[];
  modules: JointModule[];
  privateModules: { id: string; questionId: string; trigger: Letter[]; prompt: string; options: { code: Letter; text: string }[] }[];
  conditions: { id: string; questionId: string; predicate: Predicate | null }[];
  crossRules: { id: string; predicate: unknown; status: string; sourceQuestionId?: string; relatedQuestionIds?: string[]; templates?: string[]; source?: unknown }[];
  fixedRules?: { id: string; questionId: string; template: string; source: unknown }[];
  protocols?: { id: string; title: string; paragraphs: string[]; source: unknown }[];
  reviewGuides?: { id: string; title: string; paragraphs: string[] }[];
  privateGuidance?: { questionId: string; answer: Letter; template: string; source: unknown }[];
  bible?: { edition: string; attribution: string; sourceUrl: string; licenseUrl: string; sourceArchiveSha256: string; references: { reference: string; usage: string; questionIds: string[]; verses: { number: number; text: string }[] }[] };
  clauses: { id: string; title: string }[];
  safetyLevels: Record<string, Partial<Record<Letter, string>>>;
  gamblingTemplate: string;
};
export type ResponseState = "A" | "B" | "C" | "NOT_APPLICABLE" | "NOT_ANSWERED" | "BLOCKED_BY_POLICY";
export type SessionData = {
  answers: Record<string, Letter>;
  privateAnswers: Record<string, Letter>;
  context: Facts;
  // Kept separately from the letter: one episode can override Q103-B to critical.
  neckCompressionReport: boolean | null;
  // Server-derived on read, never accepted in a browser context payload.
  privateClearance?: { q181: boolean; q151?: boolean; safety: boolean; reviewId: string };
};
export type Selection = { componentId: string; respondentId?: string };
// Internal only. Never serialize a plan into a shared page, action result or log.
export type PairPlan = {
  visibility: "INTERNAL_ONLY"; questionId: string; key?: PairKey; action: string | null;
  selections: Selection[]; modules: string[]; blockers: string[];
  protocols: { id: string; privacy: Privacy; recipients: string[] }[];
  respondentsByOption?: Record<string, string[]>;
};
export type OwnQuestionDto = {
  id: string; order: number; title: string; prompt: string | null; period: string;
  state: ResponseState; options: { code: Letter; text: string }[];
  contextFields: (ContextDefinition & { id: string })[];
  privateReviewRequired?: boolean;
  relatedQuestions?: { id: string; title: string }[];
  privateModule: Catalog["privateModules"][number] | null;
  privateAnswer: Letter | null;
};
export type OwnSessionDto = {
  id: string; revision: number; status: string; version: string;
  consented: boolean; questions: OwnQuestionDto[]; context: Facts;
  neckCompressionReport: boolean | null; answered: number; blocked: number;
};
