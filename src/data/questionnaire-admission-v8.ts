import rawDefinition from "./questionario-admissao-v8.json";
import { parseQuestionnaireSeedDefinition } from "@/validations/questionnaire-seed";

export const ADMISSION_QUESTIONNAIRE_NAME = "Prova de Admissão — Contrato de Casamento";
export const admissionQuestionnaireV8 = parseQuestionnaireSeedDefinition(rawDefinition);
