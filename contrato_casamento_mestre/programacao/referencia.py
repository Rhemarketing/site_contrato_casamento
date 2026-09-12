"""Controles pontuais de referência. Não é motor completo nem API de produção."""
from decimal import Decimal

EXCLUDED_REASONS = frozenset({
    'sex','sexual_refusal','low_desire','sexual_frequency_not_met','health',
    'emotional_suffering','safety','violence','dependency','compulsion','relapse',
    'pregnancy','children_disagreement','spiritual_disagreement','legitimate_no_consensus',
    'legitimate_impediment','unemployment','lack_of_money',
})

def normalize_pair(person1_id, answer1, person2_id, answer2):
    if not person1_id or not person2_id or person1_id == person2_id:
        raise ValueError('São necessárias duas pessoas distintas.')
    if answer1 not in ('A','B','C') or answer2 not in ('A','B','C'):
        raise ValueError('Ausente/inaplicável não constitui par A/B/C.')
    return {
        'pair_key': ''.join(sorted((answer1, answer2))),
        'respondents_by_option': {c: [p for p,a in ((person1_id,answer1),(person2_id,answer2)) if a==c] for c in 'ABC'},
    }

def project_shared_component(component, *, critical_safety=False):
    """Guard de contrato. Não substitui autorização por usuário ou proteção contra inferência."""
    if critical_safety:
        return None
    if component.get('privacy_class') != 'COMMON' or component.get('output_target') != 'CONTRACT':
        return None
    if component.get('status') != 'APPROVED' or not component.get('contract_template'):
        return None
    # Allowlist: não copiar source_text, diagnóstico, nomes de alertas ou metadados privados.
    return {k: component[k] for k in ('component_id','version','contract_template')}

def contribution_eligibility(context):
    """Exige fatos já verificados; não infere intenção/impedimento a partir de silêncio."""
    if context.get('critical_safety') or context.get('exclusion_reasons') != []:
        return False
    required = ('aware_of_process','reasonable_communication_conditions',
                'explicit_or_deliberate_refusal','expired_valid_deadline',
                'no_legitimate_impediment','eligible_process_rule_confirmed','no_exclusion_reason','safety_cleared')
    return context.get('rule') == 'GENERAL_PROCESS_REFUSAL' and all(context.get(k) is True for k in required)

def contribution_amount(context):
    return Decimal('10.00') if contribution_eligibility(context) else Decimal('0.00')

def both_confirmed(member_ids, proposal_hash, confirmations):
    if len(set(member_ids)) != 2 or not proposal_hash:
        return False
    valid = {x['member_id'] for x in confirmations if x.get('hash') == proposal_hash and x.get('member_id') in member_ids}
    return valid == set(member_ids)
