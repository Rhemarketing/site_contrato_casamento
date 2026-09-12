"""Regressões da conclusão editorial 1.4.0: cobertura e limites de exposição."""
import hashlib
import json
from pathlib import Path
import re
import unittest

from planejar_combinacao import PairPlanner
from referencia import project_shared_component

ROOT = Path(__file__).resolve().parent.parent


def read(path):
    return json.loads((ROOT / path).read_text())


def digest(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(raw.encode()).hexdigest()


class JointTextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.texts = read('dados/textos_conjuntos.json')
        cls.planner = PairPlanner()
        cls.audit = read('auditoria/decisao_textos_conjuntos_1_4_0.json')
        cls.before = read('fontes/textos_conjuntos_antes_1_4_0.json')
        cls.by_id = {x['text_id']: x for x in cls.texts}

    def test_complete_exact_coverage_and_unambiguous_names(self):
        expected = {x['pair_rule_id'] for x in self.before['pair_rules']}
        self.assertEqual(len(self.texts), 487)
        self.assertEqual(expected, {x['pair_rule_id'] for x in self.texts})
        for text in self.texts:
            with self.subTest(text=text['text_id']):
                self.assertEqual(re.findall(r'\{[^{}]+\}', text['template']), ['{Nome 1}', '{Nome 2}'])
                self.assertNotRegex(text['template'], r'\b(?:PENDENTE|TODO|ALERTA_SEGURANÇA)\b')
                self.assertEqual(text['editorial_status'], 'FINAL_BY_USER_DELEGATION')
                component = self.planner.components[text['component_id']]
                self.assertEqual(text['template'], component['editorial_template'])
                self.assertEqual(text['template'], component['template_candidate'])
                self.assertEqual(hashlib.sha256(text['template'].encode()).hexdigest(), text['sha256'])

    def test_one_joint_component_selected_instead_of_two_individuals(self):
        for text in self.texts:
            with self.subTest(text=text['text_id']):
                code = text['pair_key'][0]
                result = self.planner.plan(text['question_id'], 'ana', code, 'bruno', code,
                                           applicable=True, safety_cleared=True)
                selected = [x['component_id'] for x in result['operations'] if x['operation'] == 'SELECT_PAIR_COMPONENT']
                self.assertEqual(selected, [text['component_id']])
                self.assertFalse(any(x['operation'] == 'SELECT_INDIVIDUAL_COMPONENT' for x in result['operations']))
                self.assertNotIn('EXACT_PAIR_TEXT_MISSING', result['blockers'])
                self.assertFalse(result['production_release'])
                self.assertEqual(result['bindings']['Nome 1'], 'ana')
                self.assertEqual(result['bindings']['Nome 2'], 'bruno')

    def test_safety_and_applicability_gates_still_block_shared_selection(self):
        for text in self.texts:
            code = text['pair_key'][0]
            for gates in [{'applicable': True}, {'applicable': None, 'safety_cleared': True},
                          {'applicable': False, 'safety_cleared': True},
                          {'applicable': True, 'safety_cleared': True, 'critical_safety': True}]:
                with self.subTest(text=text['text_id'], gates=gates):
                    result = self.planner.plan(text['question_id'], 'ana', code, 'bruno', code, **gates)
                    self.assertFalse(any(x['operation'] == 'SELECT_PAIR_COMPONENT' for x in result['operations']))

    def test_editorial_finality_does_not_publish_private_or_unintegrated_data(self):
        for text in self.texts:
            self.assertIsNone(project_shared_component(self.planner.components[text['component_id']]))
        for qid, a, b in [('Q060', 'A', 'C'), ('Q085', 'A', 'B'), ('Q119', 'A', 'C'),
                          ('Q151', 'A', 'B'), ('Q154', 'A', 'C'), ('Q196', 'A', 'A'),
                          ('Q197', 'A', 'A'), ('Q198', 'C', 'C'), ('Q200', 'A', 'A')]:
            rule = self.planner.rules[(qid, ''.join(sorted(a + b)))]
            if rule['action'] in ['PRIVATE_DIAGNOSTIC', 'SAFETY_FLOW', 'NO_ADDITIONAL_OUTPUT']:
                self.assertFalse(rule.get('contract_template_candidate'))

    def test_conditions_protocols_actions_and_scopes_unchanged(self):
        fields = ['action', 'additional_actions', 'privacy_class', 'output_target', 'protocol_ids',
                  'joint_module_ids', 'private_module_ids', 'event_rule_ids', 'conditional_steps',
                  'component_refs', 'pair_component_id', 'safety_gate', 'shared_pair_projection',
                  'requires_runtime_inference']
        for previous in self.before['pair_rules']:
            current = self.planner.rules[(previous['question_id'], previous['pair_key'])]
            for field in fields:
                self.assertEqual(current.get(field), previous.get(field), previous['pair_rule_id'] + ':' + field)
        for path, expected in self.audit['protected_semantic_sha256'].items():
            if path.startswith('dados/'):
                self.assertEqual(digest(read(path)), expected, path)
        changed_pairs = {x['pair_rule_id'] for x in self.texts}
        changed_components = {x['component_id'] for x in self.texts}
        untouched_pairs = [x for x in read('dados/matriz_combinacoes.json') if x['pair_rule_id'] not in changed_pairs]
        untouched_components = [x for x in read('dados/componentes_saida.json') if x['component_id'] not in changed_components]
        self.assertEqual(digest(untouched_pairs), self.audit['protected_semantic_sha256']['untouched_pair_rules'])
        self.assertEqual(digest(untouched_components), self.audit['protected_semantic_sha256']['untouched_components'])

    def test_corrected_content_is_not_replaced_by_older_permissions(self):
        template = lambda key: self.by_id[key]['template'].lower()
        self.assertIn('não utilizar intencionalmente pornografia', template('TXT-Q060-AA'))
        self.assertIn('educacional', template('TXT-Q060-AA'))
        for pair in ['BB', 'CC']:
            self.assertIn('consentimento específico', template('TXT-Q085-' + pair))
            self.assertIn('exclusão', template('TXT-Q085-' + pair))
        for pair in ['AA', 'BB', 'CC']:
            self.assertIn('mesmo dia', template('TXT-Q097-' + pair))
            self.assertIn('72 horas', template('TXT-Q097-' + pair))
            self.assertIn('volunt', template('TXT-Q130-' + pair))
            self.assertIn('momentos de qualidade', template('TXT-Q131-' + pair))
        self.assertIn('cada um apresentará o projeto', template('TXT-Q143-CC'))
        self.assertIn('não define por si só', template('TXT-Q146-AA'))
        self.assertIn('sem prazo', template('TXT-Q187-AA'))
        self.assertIn('recusa não cria dívida', template('TXT-Q083-AA'))

    def test_completed_text_cannot_bypass_couples_joint_decision(self):
        expected = [x for x in self.before['pair_rules'] if x['action'] == 'OPEN_NOS_DECIDIMOS']
        self.assertEqual(len(expected), 81)
        for previous in expected:
            current = self.planner.rules[(previous['question_id'], previous['pair_key'])]
            self.assertEqual(current['action'], 'OPEN_NOS_DECIDIMOS')
            self.assertTrue(any(x['operation'] == 'OPEN_NOS_DECIDIMOS' for x in current['conditional_steps']))
        plan = self.planner.plan('Q051', 'ana', 'A', 'bruno', 'A', applicable=True, safety_cleared=True)
        self.assertIn('QUEUE_JOINT_MODULE_VALIDATION', [x['operation'] for x in plan['operations']])


if __name__ == '__main__':
    unittest.main()
