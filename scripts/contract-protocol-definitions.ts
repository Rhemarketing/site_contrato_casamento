import type { Catalog } from "../src/features/contract/domain/types";
type SourceProtocol = { protocol_id: string; title: string; source_text: string; source_ref: unknown };
// Reviewed excerpts exclude superseded automatic contribution rules and notes.
export function compileProtocols(sources: SourceProtocol[]): NonNullable<Catalog["protocols"]> {
  return sources.map(source => {
    let text = source.source_text;
    const between = (start: string, end?: string) => {
      const index = text.indexOf(start);
      if (index < 0) throw new Error(`Protocolo sem trecho: ${source.protocol_id}`);
      const result = text.slice(index + start.length);
      if (end && !result.includes(end)) throw new Error(`Protocolo sem fechamento: ${source.protocol_id}`);
      return end ? result.slice(0, result.indexOf(end)) : result;
    };
    switch (source.protocol_id) {
      case "P01": text = between("ESCUTA E CORREÇÃO", "§ 9º"); break;
      case "P02": text = between("CONVERSA DE RECONEXÃO", "Somente a recusa injustificada"); break;
      case "P03": text = between("Substitui a regra universal anterior de 2 semanas."); break;
      case "P04": text = [...text.matchAll(/“([^”]+)”/g)].slice(-2).map(m => m[1]).join("\n\n"); break;
      case "P05": text = between("### Etapas obrigatórias", "### Texto estrutural"); break;
      case "P06": text = [...text.matchAll(/“([^”]+)”/g)].map(m => m[1].replace("{Nome 1} e {Nome 2}", "o casal")).join("\n\n"); break;
      case "P07": text = between("Etapas da fonte-base:"); break;
      case "P08": text = between("Protocolo financeiro", "A+C"); break;
      case "P09": text = between("Procedimento", "Texto estrutural"); break;
      case "P10": text = between("Etapas"); break;
      case "P11": text = between("Etapas:", "Campo"); break;
      case "P12": text = between("O sistema deverá:", "Cruzamentos"); break;
      case "P13": text = "Revelação de respostas, decisões conjuntas sobre o assunto, contribuição, confronto automático e notificações que revelem o alerta permanecem bloqueados. Não se presume que terapia conjunta seja indicada. A revisão individual exige autorização específica do titular e não supera alerta crítico ativo."; break;
      case "P14": text = between("23. CALENDÁRIO UNIFICADO"); break;
    }
    return { id: source.protocol_id, title: source.title, paragraphs: text.replace(/CONTRIBUTION_RULE = NONE/g, "Não há contribuição por consumo, recaída, dependência ou compulsão.").replace(/[*#]/g, "").replace(/\n---\s*$/, "").trim().split(/\n\s*\n/).map(p => p.replace(/\s+/g, " ").trim()).filter(Boolean), source: source.source_ref };
  });
}
