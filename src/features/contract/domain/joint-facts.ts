import type { Facts } from "./types";
export const JOINT_FACTS: Record<string, string> = {
  Q151_voluntary_agreement_requested: "Desejam abrir um acordo voluntário sobre bebidas? Para qualquer resposta, cada pessoa precisa solicitar na área privada uma revisão específica antes dessa decisão.",
  Q150_review_requested: "Realizaram a revisão do projeto de vida e desejam registrar seu resultado agora?",
  Q011_no_frequency_defined: "Ainda falta registrar uma frequência mínima de tempo exclusivo do casal?",
  Q027_ex_contact_present: "Existe contato atual com ex-parceiro que precise de um acordo?",
  Q027_relevant_disagreement: "Há divergência relevante a respeito desse contato?",
  Q028_concrete_situation: "Existe uma situação concreta de convivência a ser analisada?",
  Q028_legitimate_boundary_needed: "Os dois desejam definir um limite legítimo para essa situação?",
  Q032_concrete_friendship_conflict: "Existe um conflito concreto sobre amizade que precisa de acordo?",
  Q049_concrete_professional_opportunity: "Existe uma oportunidade profissional concreta para decidir?",
  Q050_concrete_personal_project: "Existe um projeto pessoal concreto para decidir?",
  Q124_recurring_meal_conflict: "Há conflito recorrente sobre organização das refeições?",
  Q129_concrete_prolonged_limitation: "É necessário organizar apoio diante de uma limitação prolongada? Não informem diagnóstico.",
  Q134_concrete_relevant_trip: "Existe uma viagem relevante para planejar?",
  Q135_joint_budget_requested: "Vocês desejam um orçamento específico de lazer?",
  Q139_joint_celebration_agreement_requested: "Vocês desejam registrar um acordo sobre celebrações?",
  Q174_recurring_home_visits_conflict: "Há conflito recorrente sobre visitas sociais em casa?",
  Q118_concrete_spiritual_education_need: "Há uma necessidade concreta de organizar a formação espiritual dos filhos?",
  Q144_concrete_move_opportunity: "Existe uma possibilidade concreta de mudança de localidade?",
  Q145_rlf_increased_at_least_20_percent: "A renda líquida familiar aumentou pelo menos 20% em relação à base anterior registrada?",
  Q146_sufficient_consensus: "Já existe consenso suficiente para discutir o planejamento de filhos?",
  Q146_both_agree_to_joint_decision: "Ambos desejam abrir uma decisão de planejamento reprodutivo agora?",
  Q148_concrete_risky_project: "Existe um projeto concreto com exposição financeira para decidir?",
  Q149_concrete_postponed_project: "Existe um projeto concreto adiado que precisa de revisão agendada?",
  Q164_child_schedule_definition_needed: "É necessário definir horários de referência para algum filho?",
  Q165_school_responsibility_imbalance: "O acompanhamento escolar precisa de redistribuição de responsabilidades?",
  Q168_concrete_child_activity: "Existe uma atividade concreta de um filho para decidir?",
  Q092_relevant_expectation_difference: "Existe diferença relevante de expectativa sobre convivência com as famílias?",
  Q092_recurring_frequency_conflict: "Há conflito recorrente sobre frequência de convivência com as famílias?",
  Q096_concrete_care_need: "Existe uma necessidade concreta de cuidado de familiar?",
  Q096_relevant_reorganization_needed: "Esse cuidado exige reorganização relevante do casal?",
  Q100_concrete_housing_request: "Existe um pedido concreto de moradia temporária de familiar?",
};
export function agreedFacts(a: Facts, b: Facts): Facts {
  return Object.fromEntries(Object.keys(JOINT_FACTS).map(key => [key, typeof a[key] === "boolean" && a[key] === b[key] ? a[key] : null]));
}
export type JointFactsDto = { revision: number; own: Facts; agreed: Facts; fields: { id: string; label: string }[] };
