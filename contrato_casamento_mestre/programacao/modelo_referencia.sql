-- Modelo relacional de referência, validável localmente com SQLite.
-- Proposta técnica. Não é migração pronta de produção nem implementa autorização.
PRAGMA foreign_keys = ON;

CREATE TABLE persons (
  person_id TEXT PRIMARY KEY,
  auth_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL
);
CREATE TABLE couples (couple_id TEXT PRIMARY KEY, created_at TEXT NOT NULL);
CREATE TABLE couple_members (
  membership_id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples,
  person_id TEXT NOT NULL REFERENCES persons,
  member_position INTEGER NOT NULL CHECK(member_position IN (1,2)),
  UNIQUE(couple_id, member_position), UNIQUE(couple_id, person_id)
);
CREATE TABLE questionnaire_versions (
  questionnaire_version_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('ADMISSION','MAIN')),
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('DRAFT','PUBLISHED','RETIRED')),
  content_hash TEXT NOT NULL,
  UNIQUE(kind,version)
);
CREATE TABLE questions (
  question_id TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT,
  prompt_text TEXT,
  applicability_json TEXT,
  reference_period_json TEXT,
  nos_trigger_type TEXT CHECK(nos_trigger_type IN ('ALWAYS','DIVERGENCE_ONLY','CONCRETE_EVENT_ONLY','OPTIONAL','CONDITION_ONLY','NEVER')),
  source_ref_json TEXT NOT NULL,
  effective_from TEXT, effective_to TEXT,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK(is_active IN (0,1)),
  PRIMARY KEY(question_id,version),
  CHECK(is_active=0 OR (prompt_text IS NOT NULL AND applicability_json IS NOT NULL AND nos_trigger_type IS NOT NULL))
);
CREATE TABLE questionnaire_items (
  questionnaire_version_id TEXT NOT NULL REFERENCES questionnaire_versions,
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  PRIMARY KEY(questionnaire_version_id,question_id),
  UNIQUE(questionnaire_version_id,display_order),
  FOREIGN KEY(question_id,question_version) REFERENCES questions(question_id,version)
);
CREATE TABLE question_options (
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  code TEXT NOT NULL CHECK(code IN ('A','B','C')),
  option_text TEXT,
  PRIMARY KEY(question_id,question_version,code),
  FOREIGN KEY(question_id,question_version) REFERENCES questions(question_id,version)
);
CREATE TABLE output_components (
  component_id TEXT NOT NULL, version TEXT NOT NULL,
  privacy_class TEXT CHECK(privacy_class IN ('COMMON','PRIVATE','SAFETY_PRIVATE')),
  output_target TEXT CHECK(output_target IN ('CONTRACT','JOINT_PLAN','PRIVATE_PLAN','INTERNAL','NONE')),
  template_text TEXT, variables_json TEXT,
  clause_id TEXT, deduplication_group TEXT,
  source_ref_json TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK(is_active IN (0,1)),
  PRIMARY KEY(component_id,version),
  CHECK(privacy_class='COMMON' OR output_target NOT IN ('CONTRACT','JOINT_PLAN')),
  CHECK(is_active=0 OR (privacy_class IS NOT NULL AND output_target IS NOT NULL))
);
CREATE TABLE option_outputs (
  question_id TEXT NOT NULL, question_version TEXT NOT NULL, option_code TEXT NOT NULL,
  component_id TEXT NOT NULL, component_version TEXT NOT NULL, output_order INTEGER NOT NULL,
  PRIMARY KEY(question_id,question_version,option_code,component_id,component_version),
  FOREIGN KEY(question_id,question_version,option_code) REFERENCES question_options,
  FOREIGN KEY(component_id,component_version) REFERENCES output_components
);
CREATE TABLE pair_rules (
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  pair_key TEXT NOT NULL CHECK(pair_key IN ('AA','AB','AC','BB','BC','CC')),
  action TEXT CHECK(action IN ('MERGE_EXACT_TEXT','KEEP_INDIVIDUAL_OUTPUTS','USE_COMPATIBILITY_TEXT','OPEN_NOS_DECIDIMOS','PRIVATE_DIAGNOSTIC','SAFETY_FLOW','TRIGGER_PROTOCOL','NO_ADDITIONAL_OUTPUT')),
  additional_actions_json TEXT,
  predicate_json TEXT, source_ref_json TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK(is_active IN (0,1)),
  PRIMARY KEY(question_id,question_version,pair_key),
  FOREIGN KEY(question_id,question_version) REFERENCES questions,
  CHECK(is_active=0 OR action IS NOT NULL)
);
CREATE TABLE pair_rule_outputs (
  question_id TEXT NOT NULL, question_version TEXT NOT NULL, pair_key TEXT NOT NULL,
  component_id TEXT NOT NULL, component_version TEXT NOT NULL,
  PRIMARY KEY(question_id,question_version,pair_key,component_id,component_version),
  FOREIGN KEY(question_id,question_version,pair_key) REFERENCES pair_rules,
  FOREIGN KEY(component_id,component_version) REFERENCES output_components
);
CREATE TABLE fixed_rules (
  fixed_rule_id TEXT NOT NULL, version TEXT NOT NULL,
  component_id TEXT NOT NULL, component_version TEXT NOT NULL,
  PRIMARY KEY(fixed_rule_id,version),
  FOREIGN KEY(component_id,component_version) REFERENCES output_components
);
CREATE TABLE question_fixed_rules (
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  fixed_rule_id TEXT NOT NULL, fixed_rule_version TEXT NOT NULL,
  PRIMARY KEY(question_id,question_version,fixed_rule_id,fixed_rule_version),
  FOREIGN KEY(question_id,question_version) REFERENCES questions,
  FOREIGN KEY(fixed_rule_id,fixed_rule_version) REFERENCES fixed_rules
);
CREATE TABLE protocols (
  protocol_id TEXT NOT NULL, version TEXT NOT NULL, title TEXT NOT NULL,
  trigger_json TEXT, steps_json TEXT, privacy_json TEXT, source_ref_json TEXT,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK(is_active IN (0,1)),
  PRIMARY KEY(protocol_id,version)
);
CREATE TABLE question_protocols (
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  protocol_id TEXT NOT NULL, protocol_version TEXT NOT NULL, trigger_json TEXT NOT NULL,
  PRIMARY KEY(question_id,question_version,protocol_id,protocol_version),
  FOREIGN KEY(question_id,question_version) REFERENCES questions,
  FOREIGN KEY(protocol_id,protocol_version) REFERENCES protocols
);
CREATE TABLE joint_modules (
  joint_module_id TEXT NOT NULL, version TEXT NOT NULL,
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  prompt_text TEXT, trigger_json TEXT, fields_schema_json TEXT,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK(is_active IN (0,1)),
  PRIMARY KEY(joint_module_id,version),
  FOREIGN KEY(question_id,question_version) REFERENCES questions
);
CREATE TABLE joint_options (
  joint_module_id TEXT NOT NULL, joint_module_version TEXT NOT NULL,
  code TEXT NOT NULL, option_text TEXT, component_id TEXT, component_version TEXT,
  PRIMARY KEY(joint_module_id,joint_module_version,code),
  FOREIGN KEY(joint_module_id,joint_module_version) REFERENCES joint_modules,
  FOREIGN KEY(component_id,component_version) REFERENCES output_components
);
CREATE TABLE response_sessions (
  session_id TEXT PRIMARY KEY, membership_id TEXT NOT NULL REFERENCES couple_members,
  questionnaire_version_id TEXT NOT NULL REFERENCES questionnaire_versions,
  status TEXT NOT NULL CHECK(status IN ('NOT_STARTED','IN_PROGRESS','SUBMITTED','SUPERSEDED')),
  revision INTEGER NOT NULL DEFAULT 0, submitted_at TEXT
);
CREATE TABLE responses (
  response_id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES response_sessions,
  question_id TEXT NOT NULL, question_version TEXT NOT NULL,
  response_state TEXT NOT NULL CHECK(response_state IN ('ANSWERED','NOT_APPLICABLE','NOT_ANSWERED','BLOCKED_BY_POLICY')),
  option_code TEXT, revision INTEGER NOT NULL, updated_at TEXT NOT NULL,
  UNIQUE(session_id,question_id),
  FOREIGN KEY(question_id,question_version) REFERENCES questions,
  FOREIGN KEY(question_id,question_version,option_code) REFERENCES question_options,
  CHECK((response_state='ANSWERED' AND option_code IS NOT NULL AND option_code IN ('A','B','C')) OR (response_state!='ANSWERED' AND option_code IS NULL))
);
CREATE TABLE evaluation_runs (
  evaluation_id TEXT PRIMARY KEY, couple_id TEXT NOT NULL REFERENCES couples,
  member1_session_id TEXT NOT NULL REFERENCES response_sessions,
  member2_session_id TEXT NOT NULL REFERENCES response_sessions,
  engine_version TEXT NOT NULL, input_hash TEXT NOT NULL, rule_version TEXT NOT NULL,
  status TEXT NOT NULL, created_at TEXT NOT NULL,
  UNIQUE(couple_id,input_hash,engine_version,rule_version),
  CHECK(member1_session_id!=member2_session_id)
);
CREATE TABLE joint_decisions (
  decision_id TEXT NOT NULL, revision INTEGER NOT NULL,
  evaluation_id TEXT NOT NULL REFERENCES evaluation_runs,
  joint_module_id TEXT NOT NULL, joint_module_version TEXT NOT NULL, selected_code TEXT,
  parameters_json TEXT, content_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('OPEN','PROPOSED','CONFIRMED_BY_BOTH','NO_CONSENSUS','SUPERSEDED')),
  PRIMARY KEY(decision_id,revision),
  FOREIGN KEY(joint_module_id,joint_module_version,selected_code) REFERENCES joint_options
);
CREATE TABLE joint_confirmations (
  decision_id TEXT NOT NULL, decision_revision INTEGER NOT NULL,
  membership_id TEXT NOT NULL REFERENCES couple_members,
  confirmed_hash TEXT NOT NULL, confirmed_at TEXT NOT NULL,
  PRIMARY KEY(decision_id,decision_revision,membership_id),
  FOREIGN KEY(decision_id,decision_revision) REFERENCES joint_decisions
);
CREATE TABLE alerts (
  alert_id TEXT PRIMARY KEY, evaluation_id TEXT NOT NULL REFERENCES evaluation_runs,
  recipient_membership_id TEXT NOT NULL REFERENCES couple_members,
  severity TEXT NOT NULL, private_payload_ref TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE protocol_instances (
  instance_id TEXT PRIMARY KEY, evaluation_id TEXT NOT NULL REFERENCES evaluation_runs,
  protocol_id TEXT NOT NULL, protocol_version TEXT NOT NULL,
  source_event_id TEXT NOT NULL, opened_at TEXT NOT NULL, deadline_at TEXT,
  result TEXT CHECK(result IN ('SIM','PARCIAL','NAO')),
  UNIQUE(evaluation_id,protocol_id,protocol_version,source_event_id),
  FOREIGN KEY(protocol_id,protocol_version) REFERENCES protocols
);
CREATE TABLE contract_versions (
  contract_id TEXT NOT NULL, version INTEGER NOT NULL,
  couple_id TEXT NOT NULL REFERENCES couples, evaluation_id TEXT NOT NULL REFERENCES evaluation_runs,
  status TEXT NOT NULL, rendered_document_ref TEXT, content_hash TEXT, snapshot_json TEXT NOT NULL,
  PRIMARY KEY(contract_id,version)
);
CREATE TABLE contract_components (
  contract_id TEXT NOT NULL, contract_version INTEGER NOT NULL,
  component_id TEXT NOT NULL, component_version TEXT NOT NULL,
  clause_id TEXT NOT NULL, display_order INTEGER NOT NULL, variables_json TEXT NOT NULL,
  PRIMARY KEY(contract_id,contract_version,component_id,component_version,display_order),
  FOREIGN KEY(contract_id,contract_version) REFERENCES contract_versions,
  FOREIGN KEY(component_id,component_version) REFERENCES output_components
);
CREATE TABLE review_schedule (
  review_id TEXT PRIMARY KEY, couple_id TEXT NOT NULL REFERENCES couples,
  subject_id TEXT NOT NULL, next_at TEXT NOT NULL, timezone TEXT NOT NULL,
  can_combine INTEGER NOT NULL CHECK(can_combine IN (0,1)),
  immediate_trigger INTEGER NOT NULL CHECK(immediate_trigger IN (0,1)),
  CHECK(immediate_trigger=0 OR can_combine=0)
);
CREATE TABLE reconnection_entries (
  entry_id TEXT PRIMARY KEY, couple_id TEXT NOT NULL REFERENCES couples,
  instance_id TEXT NOT NULL REFERENCES protocol_instances,
  source_event_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL CHECK(amount_cents>=0), currency TEXT NOT NULL,
  eligibility_evidence_ref TEXT NOT NULL, status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE purchases (
  purchase_id TEXT PRIMARY KEY, purchaser_person_id TEXT NOT NULL REFERENCES persons,
  provider_reference TEXT UNIQUE, status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL, currency TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE entitlements (
  entitlement_id TEXT PRIMARY KEY, purchase_id TEXT NOT NULL REFERENCES purchases,
  couple_id TEXT REFERENCES couples, status TEXT NOT NULL,
  valid_from TEXT, valid_until TEXT
);
CREATE TABLE audit_events (
  event_id TEXT PRIMARY KEY, actor_ref TEXT, action TEXT NOT NULL,
  entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, entity_version TEXT,
  happened_at TEXT NOT NULL, trace_id TEXT NOT NULL
);

-- Regras de publicação que dependem de agregação e autorização ficam na aplicação:
-- 3 opções por pergunta; 6 pares por pergunta; 200 itens MAIN/40 ADMISSION;
-- ambas as sessões do mesmo casal e da versão adequada;
-- pergunta respondida pertencente à versão congelada da sessão;
-- dois aceites de membros distintos do mesmo casal e do hash vigente;
-- imutabilidade de conteúdo publicado;
-- componentes do contrato somente COMMON/CONTRACT;
-- segurança antes de qualquer projeção compartilhada;
-- política de privacidade e acesso por linha/objeto no servidor.
