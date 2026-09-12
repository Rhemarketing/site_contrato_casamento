"""Valida inventário e reporta bloqueios. Só usa a biblioteca padrão do Python."""
from pathlib import Path
import argparse,collections,hashlib,json,re,sys

ROOT=Path(__file__).resolve().parent.parent
def load(name):return json.loads((ROOT/name).read_text())

def validate():
    errors=[];blockers=[]
    q=load('dados/perguntas.json');pairs=load('dados/matriz_combinacoes.json')
    policy=load('dados/regras_globais.json');protocols=load('dados/protocolos.json')
    patches=load('dados/correcoes_fonte.json');joint=load('dados/nos_decidimos.json')
    qids={x['question_id'] for x in q};pids={x['protocol_id'] for x in protocols};patchids={p['patch_id'] for p in patches}
    if len(q)!=200 or qids!={f'Q{i:03}' for i in range(1,201)}:errors.append('Inventário deve conter 200 IDs únicos Q001–Q200.')
    if len(pairs)!=1200:errors.append('Matriz deve conter 1.200 registros.')
    if len(protocols)!=14 or len(pids)!=14:errors.append('Inventário deve conter 14 protocolos únicos.')
    grouped=collections.defaultdict(list)
    for p in pairs:
        grouped[p['question_id']].append(p['pair_key'])
        if p['question_id'] not in qids:errors.append('Par referencia pergunta inexistente: '+p['pair_rule_id'])
        if p['action'] is not None and p['action'] not in policy['pair_actions']:errors.append('Ação inválida: '+p['pair_rule_id'])
        if any(pid not in pids for pid in p['protocol_ids']):errors.append('Protocolo inexistente: '+p['pair_rule_id'])
        if p['action'] is None:blockers.append({'id':p['pair_rule_id'],'reason':'MISSING_PAIR_ACTION'})
        for dependency in p.get('execution_dependencies',[]):
            blockers.append({'id':p['pair_rule_id'],'reason':dependency})
        if p['is_active']:blockers.append({'id':p['pair_rule_id'],'reason':'RECHECK_RELEASE_AS_COMPLETE_GRAPH'})
    for x in q:
        qid=x['question_id']
        if sorted(grouped[qid])!=policy['pair_keys']:errors.append('Pares duplicados ou ausentes: '+qid)
        if [o['code'] for o in x['options']]!=list('ABC'):errors.append('Alternativas devem ser A/B/C: '+qid)
        if any(p not in patchids for p in x['patch_ids']):errors.append('Correção inexistente: '+qid)
        for code in ('source_content_status','production_status'):
            if not x.get(code):errors.append('Estado ausente: '+qid)
        if not all(o['text'] for o in x['options']):blockers.append({'id':qid,'reason':'MISSING_COMPLETE_ABC'})
        if not x['prompt_text']:blockers.append({'id':qid,'reason':'MISSING_FINAL_PROMPT'})
        if x['applicability_rule'] is None:blockers.append({'id':qid,'reason':'MISSING_APPLICABILITY_PREDICATE'})
        if x['nos_trigger_type'] is None:blockers.append({'id':qid,'reason':'MISSING_NOS_TRIGGER'})
        if not x['is_active']:blockers.append({'id':qid,'reason':'NOT_RELEASED'})
        for o in x['options']:
            if o['privacy_class'] is None or o['output_target'] is None:blockers.append({'id':qid+'-'+o['code'],'reason':'MISSING_OUTPUT_ROUTING'})
            if o['privacy_class'] in ['PRIVATE','SAFETY_PRIVATE'] and o['output_target'] in ['CONTRACT','JOINT_PLAN']:errors.append('Saída privada compartilhável: '+qid+'-'+o['code'])
        if qid in ['Q196','Q197','Q198','Q200'] and any(o['privacy_class']!='PRIVATE' or o['output_target']!='INTERNAL' for o in x['options']):errors.append('Roteamento final incorreto: '+qid)
    for m in joint:
        if m['question_id'] not in qids:errors.append('Decisão conjunta referencia pergunta inexistente.')
        if m['question_id']=='Q131' and m['is_active']:errors.append('Calendário Q131 substituído não pode estar ativo.')
    master=load('dados/arquivo_mestre.json')
    for key,name in master['collection_files'].items():
        if master['collections'][key]!=load(name):errors.append('Consolidado difere da coleção: '+key)
    manifest=load('MANIFESTO.json')
    for item in manifest['files']:
        path=ROOT/item['path']
        if not path.is_file():errors.append('Arquivo ausente: '+item['path']);continue
        if hashlib.sha256(path.read_bytes()).hexdigest()!=item['sha256']:errors.append('Hash divergente: '+item['path'])
    blockers.extend({'id':i,'reason':r} for i,r in [
        ('BIBLE','PENDING_TRANSLATION_AND_TEXTS'),
        ('PRIVATE_REVIEW','PENDING_OPERATIONAL_SUPPORT_PATH')])
    if not policy.get('canonical_5_available'):
        blockers.append({'id':'V5','reason':'MISSING_FULL_CANONICAL_PACKAGE'})
    if policy.get('gambling',{}).get('policy') != 'TOTAL_PROHIBITION':
        blockers.append({'id':'Q154','reason':'PENDING_EDITORIAL_GAMBLING_POLICY'})
    admission=load('dados/admissao_e_compra.json')
    if admission.get('pending_in_this_master') is not False:
        blockers.append({'id':'ADMISSION','reason':'MISSING_40_QUESTIONS_AND_METHOD'})
    if 'output_components' in master['collections']:
        components={c['component_id']:c for c in master['collections']['output_components']}
        conditions={c['condition_id']:c for c in master['collections']['flow_conditions']}
        for pair in pairs:
            refs=[x['component_id'] for x in pair['component_refs']]
            if pair.get('pair_component_id'):refs.append(pair['pair_component_id'])
            if any(ref not in components for ref in refs):errors.append('Componente de par inexistente: '+pair['pair_rule_id'])
            for step in pair['conditional_steps']:
                if step.get('condition_id') and step['condition_id'] not in conditions:
                    errors.append('Condição inexistente: '+pair['pair_rule_id'])
            if pair['action'] in ['PRIVATE_DIAGNOSTIC','SAFETY_FLOW'] and pair.get('contract_template_candidate'):
                errors.append('Candidato compartilhável em par privado: '+pair['pair_rule_id'])
        if len(conditions)!=200:errors.append('Deve haver um perfil de condição para cada pergunta.')
    if 'joint_texts' in master['collections']:
        texts=master['collections']['joint_texts']
        pair_index={x['pair_rule_id']:x for x in pairs}
        old=load('fontes/textos_conjuntos_antes_1_4_0.json')
        expected={x['pair_rule_id'] for x in old['pair_rules']}
        if len(texts)!=487 or {x['pair_rule_id'] for x in texts}!=expected:
            errors.append('A conclusão editorial exige os 487 pares exatos do inventário anterior.')
        if len({x['text_id'] for x in texts})!=len(texts):
            errors.append('IDs duplicados no catálogo de textos conjuntos.')
        for t in texts:
            tid=t['text_id'];p=pair_index.get(t['pair_rule_id']);c=components.get(t['component_id'])
            if p is None or c is None:
                errors.append('Vínculo inexistente de texto conjunto: '+tid);continue
            if t['pair_key'] not in ['AA','BB','CC'] or p['pair_key']!=t['pair_key'] or p['question_id']!=t['question_id']:
                errors.append('Texto conjunto ligado a pergunta/par incorreto: '+tid)
            if p.get('pair_component_id')!=t['component_id'] or c.get('text_decision_id')!=tid:
                errors.append('Componente incorreto para texto conjunto: '+tid)
            text=t.get('template')
            if not text or text!=c.get('editorial_template') or text!=c.get('template_candidate') or text!=p.get('contract_template_candidate'):
                errors.append('Redação conjunta ausente ou divergente: '+tid)
            if not text or re.findall(r'\{[^{}]+\}',text)!=['{Nome 1}','{Nome 2}']:
                errors.append('Nomes ambíguos ou campos desconhecidos no texto conjunto: '+tid)
            if text and hashlib.sha256(text.encode()).hexdigest()!=t.get('sha256'):
                errors.append('Hash divergente da redação conjunta: '+tid)
            if any(x.get('privacy_class')!='COMMON' or x.get('output_target')!='CONTRACT' for x in [p,c,t]):
                errors.append('Redação conjunta associada a dados privados: '+tid)
            if t.get('editorial_status')!='FINAL_BY_USER_DELEGATION':
                errors.append('Estado editorial inesperado: '+tid)
            if p.get('joint_module_ids')!=t.get('joint_module_ids') or p.get('conditional_steps')!=t.get('conditional_steps_preserved'):
                errors.append('Texto conjunto alterou etapa de decisão conjunta: '+tid)
            if 'EXACT_PAIR_TEXT_MISSING' in p.get('execution_dependencies',[]):
                errors.append('Pendência editorial obsoleta: '+tid)
    return {'package_integrity_ok':not errors,'errors':errors,'production_ready':not errors and not blockers,
            'blocker_count':len(blockers),'blocker_counts_by_reason':dict(collections.Counter(x['reason'] for x in blockers)),
            'coverage':load('auditoria/cobertura.json'),'blockers':blockers}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--production',action='store_true');ap.add_argument('--report',type=Path)
    args=ap.parse_args();result=validate()
    if args.report:args.report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='blockers'},ensure_ascii=False,indent=2))
    sys.exit(1 if result['errors'] else (2 if args.production and not result['production_ready'] else 0))
