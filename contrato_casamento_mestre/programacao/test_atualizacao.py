"""Regressões da incorporação 1.1.0; não certificam o produto em produção."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def load(name):
    return json.loads((ROOT / name).read_text())

class AtualizacaoTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.questions = {q['question_id']: q for q in load('dados/perguntas.json')}
        cls.history = {q['question_id']: q for q in load('fontes/historico_incorporacao_1_1_0.json')}

    def test_coverage_and_recovery(self):
        missing = [qid for qid, q in self.questions.items() if not all(o['text'] for o in q['options'])]
        expected = [f'Q{i:03}' for i in [*range(51, 61), *range(71, 101)]]
        # The prior missing list is a historical snapshot; 1.2.0 supplies these IDs.
        if load('dados/arquivo_mestre.json')['package_version'] == '1.1.0':
            self.assertEqual(missing, expected)
        else:
            self.assertEqual(load('auditoria/atualizacao_1_1_0.json')['missing_ids'], expected)
            self.assertEqual(missing, [])
        recovered = load('auditoria/atualizacao_1_1_0.json')['recovered_ids']
        self.assertEqual(len(set(recovered)), 61)
        for qid in recovered:
            self.assertTrue(self.questions[qid]['prompt_text'])
            self.assertTrue(all(o['text'] for o in self.questions[qid]['options']))
            self.assertFalse(all(o['text'] for o in self.history[qid]['prior_record']['options']))

    def test_later_replacements_preserved(self):
        for qid in ['Q111', 'Q142', 'Q153', 'Q187']:
            prior = self.history[qid]['prior_record']
            self.assertEqual(self.questions[qid]['prompt_text'], prior['prompt_text'])
            for current, old in zip(self.questions[qid]['options'], prior['options']):
                self.assertEqual(current['text'], old['text'])
                self.assertEqual(current['effect_source_text'], old['effect_source_text'])

    def test_private_outputs_remain_internal(self):
        for qid in ['Q196', 'Q197', 'Q198', 'Q200']:
            for option in self.questions[qid]['options']:
                self.assertEqual(option['privacy_class'], 'PRIVATE')
                self.assertEqual(option['output_target'], 'INTERNAL')
                self.assertIsNone(option['contract_template'])
                self.assertIsNone(option.get('effect_template_candidate'))

    def test_safety_is_not_joint_negotiation(self):
        for i in range(101, 111):
            q = self.questions[f'Q{i:03}']
            self.assertEqual(q['nos_trigger_type'], 'NEVER')
            self.assertEqual(q['contribution_rule'], 'NONE')
            for option in q['options'][1:]:
                self.assertEqual(option['privacy_class'], 'SAFETY_PRIVATE')
                self.assertNotIn(option['output_target'], ['CONTRACT', 'JOINT_PLAN'])
        private = load('dados/subperguntas_privadas.json')[0]
        self.assertEqual(private['question_id'], 'Q119')
        self.assertEqual(private['trigger']['answer_in'], ['B', 'C'])

    def test_corrected_autonomy_and_spiritual_frequencies(self):
        self.assertIn('compromissos familiares legitimamente assumidos', self.questions['Q109']['options'][0]['text'])
        self.assertIn('projeto específico importante', self.questions['Q143']['options'][2]['text'])
        for module in load('dados/nos_decidimos.json'):
            if module['question_id'] in ['Q112', 'Q113']:
                choice = next(o for o in module['option_candidates'] if o['code'] == 'C')
                self.assertEqual(choice['text_candidate'], 'Outra frequência consensualmente escolhida.')
                self.assertIn('{frequência escolhida}', choice['contract_template_candidate'])

    def test_remaining_editorial_and_protocol_blocks(self):
        self.assertFalse(self.questions['Q154']['is_active'])
        pair = next(p for p in load('dados/matriz_combinacoes.json') if p['question_id'] == 'Q146' and p['pair_key'] == 'AC')
        self.assertEqual(pair['protocol_ids'], ['P09'])
        self.assertTrue(pair['joint_blocked'])
        self.assertEqual(pair['joint_module_ids'], [])

if __name__ == '__main__':
    unittest.main()
