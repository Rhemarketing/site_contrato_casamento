"""Planejamento interno de pares. Não publica contrato e não retorna resposta para o cônjuge.

Os fatos de contexto devem vir de eventos verificados pelo servidor. Valores ausentes
são desconhecidos. Este módulo não os deduz de uma alternativa ou da ausência de resposta.
"""
import json
from pathlib import Path
from referencia import normalize_pair

ROOT = Path(__file__).resolve().parent.parent

def evaluate_predicate(node, answer_pair, facts):
    """Lógica com três resultados: True, False e None (desconhecido)."""
    if node is None:
        return None
    op = node['op']
    if op == 'literal':
        if type(node['value']) is not bool:
            raise ValueError('Literal exige booleano.')
        return node['value']
    if op == 'fact':
        value = facts.get(node['name'])
        if value is not None and type(value) is not bool:
            raise ValueError('Fato exige booleano ou null.')
        return value
    if op == 'any_answer':
        return any(c in answer_pair for c in node['codes'])
    if op == 'not':
        value = evaluate_predicate(node['item'], answer_pair, facts)
        return None if value is None else not value
    if op in ('all', 'any'):
        values = [evaluate_predicate(x, answer_pair, facts) for x in node['items']]
        if op == 'all':
            return False if False in values else (None if None in values else True)
        return True if True in values else (None if None in values else False)
    raise ValueError('Operador desconhecido: ' + op)

class PairPlanner:
    def __init__(self, root=ROOT):
        def read(name):
            return json.loads((root / name).read_text())
        self.rules = {(r['question_id'], r['pair_key']): r for r in read('dados/matriz_combinacoes.json')}
        self.components = {c['component_id']: c for c in read('dados/componentes_saida.json')}
        self.conditions = {c['condition_id']: c for c in read('dados/condicoes_fluxo.json')}

    def plan(self, question_id, member1, answer1, member2, answer2, *, applicable=None,
             safety_cleared=None, critical_safety=False, facts=None):
        normalized = normalize_pair(member1, answer1, member2, answer2)
        key = normalized['pair_key']
        result = {'visibility': 'INTERNAL_ONLY', 'question_id': question_id, 'pair_key': key,
                  'action': None, 'operations': [], 'blockers': [], 'production_release': False}
        if critical_safety:
            result.update(action='SAFETY_FLOW', operations=[{'operation':'TRIGGER_PROTOCOL',
                          'protocol_id':'P13','visibility':'SAFETY_PRIVATE'}])
            return result
        if applicable is not True:
            result['blockers'].append('NOT_APPLICABLE' if applicable is False else 'APPLICABILITY_UNKNOWN')
            return result
        rule = self.rules[(question_id, key)]
        result['action'] = rule['action']
        if rule['action'] == 'SAFETY_FLOW':
            result['operations'] = [{'operation':'TRIGGER_PROTOCOL','protocol_id':'P13',
                                     'visibility':'SAFETY_PRIVATE'}]
            return result
        if not rule['action']:
            result['blockers'] = list(rule['execution_dependencies'])
            return result
        if rule['action'] == 'PRIVATE_DIAGNOSTIC':
            # The comparison and raw answer metadata never become a public payload.
            result['operations'] = [{'operation':'PRIVATE_DIAGNOSTIC',
                                     'rule_id':rule['pair_rule_id'],'visibility':'PRIVATE'}]
            for module in rule['private_module_ids']:
                codes = 'C' if module == 'PF-Q081-01' else 'BC'
                recipients = [m for m,a in ((member1,answer1),(member2,answer2)) if a in codes]
                result['operations'].append({'operation':'OPEN_PRIVATE_MODULE','module_id':module,
                                             'recipients':recipients,'visibility':'PRIVATE'})
            for step in rule['conditional_steps']:
                if step['operation'] == 'TRIGGER_PROTOCOL' and evaluate_predicate(step['when'], key, facts or {}) is True:
                    result['operations'].append({'operation':'TRIGGER_PROTOCOL',
                                                 'protocol_id':step['protocol_id'],'visibility':'PRIVATE'})
            result['blockers'] = list(rule['execution_dependencies'])
            return result
        if rule['action'] == 'NO_ADDITIONAL_OUTPUT':
            result['operations'] = [{'operation':'REGISTER_INTERNAL_AGGREGATE_INPUT',
                                     'aggregate_rule_ref':rule.get('aggregate_rule_ref')}]
            return result
        if safety_cleared is not True:
            result['blockers'] = ['SAFETY_NOT_CLEARED']
            return result
        result['blockers'] = list(rule['execution_dependencies'])
        result['bindings'] = {'Nome 1':member1,'Nome 2':member2,
                              **{f'Nome {c}':ids for c,ids in normalized['respondents_by_option'].items()}}
        if rule['action'] == 'TRIGGER_PROTOCOL':
            result['operations'] += [{'operation':'TRIGGER_PROTOCOL','protocol_id':p}
                                     for p in rule['protocol_ids']]
        if rule.get('pair_component_id'):
            component = self.components[rule['pair_component_id']]
            if component['template_candidate']:
                result['operations'].append({'operation':'SELECT_PAIR_COMPONENT',
                                             'component_id':component['component_id']})
        else:
            for member, answer in ((member1,answer1),(member2,answer2)):
                cid = f'OUT-{question_id}-{answer}'
                result['operations'].append({'operation':'SELECT_INDIVIDUAL_COMPONENT',
                                             'component_id':cid,'respondent_id':member})
        for step in rule['conditional_steps']:
            if step['operation'] != 'OPEN_NOS_DECIDIMOS':
                continue
            verdict = evaluate_predicate(step['when'], key, facts or {})
            if verdict is None:
                result['blockers'].append('CONTEXT_REQUIRED:' + step['condition_id'])
            elif verdict:
                result['operations'].append({'operation':'QUEUE_JOINT_MODULE_VALIDATION',
                                             'module_ids':step['module_ids']})
        # Candidate selection is not permission to render. Production always uses approved components.
        result['blockers'] = sorted(set(result['blockers']))
        return result
