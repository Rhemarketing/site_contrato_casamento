"""Protege fontes, substituições e privacidade após a recuperação das 200 perguntas."""
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
def load(name):
    return json.loads((ROOT / name).read_text())

class Cobertura200Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.q = {q['question_id']: q for q in load('dados/perguntas.json')}
        cls.joint = load('dados/nos_decidimos.json')
        cls.protocols = {p['protocol_id']: p for p in load('dados/protocolos.json')}

    def test_all_questions_have_prompt_and_three_choices(self):
        self.assertEqual(set(self.q), {f'Q{i:03}' for i in range(1, 201)})
        for q in self.q.values():
            self.assertTrue(q['prompt_text'])
            self.assertEqual([o['code'] for o in q['options']], list('ABC'))
            self.assertTrue(all(o['text'] for o in q['options']))
        self.assertEqual(len(load('auditoria/atualizacao_1_2_0.json')['recovered_ids']), 40)

    def test_canonical_replacements_not_obsolete_bases(self):
        self.assertEqual(self.q['Q051']['options'][2]['text'], 'Gostaria que a intimidade sexual acontecesse com menor frequência.')
        self.assertEqual(self.q['Q055']['title'], 'MOMENTO PROGRAMADO DE INTIMIDADE E RECONEXÃO')
        self.assertEqual(self.q['Q079']['title'], 'MELHOR PERÍODO PARA A INTIMIDADE')
        self.assertEqual(self.q['Q079']['nos_trigger_type'], 'NEVER')
        self.assertEqual(self.q['Q056']['options'][1]['text'], 'Essas demonstrações existem, mas acontecem de maneira irregular.')

    def test_safety_and_confidentiality_not_reopened(self):
        self.assertFalse(any(m['question_id'] == 'Q060' for m in self.joint))
        self.assertEqual(self.q['Q060']['nos_trigger_type'], 'NEVER')
        self.assertFalse(self.q['Q085']['data_collection_policy']['accept_intimate_media_uploads'])
        for qid, codes in {'Q060':'BC','Q075':'BC','Q081':'C','Q087':'BC'}.items():
            for o in self.q[qid]['options']:
                if o['code'] in codes:
                    self.assertEqual(o['privacy_class'], 'PRIVATE')
                    self.assertIsNone(o.get('effect_template_candidate'))
                    self.assertNotIn(o['output_target'], ['CONTRACT', 'JOINT_PLAN'])
        private = next(m for m in load('dados/subperguntas_privadas.json') if m['question_id'] == 'Q081')
        self.assertEqual(private['trigger']['answer_in'], ['C'])
        self.assertEqual(private['output_target'], 'INTERNAL')

    def test_family_decisions_and_reconnection_clock(self):
        m = next(m for m in self.joint if m['question_id'] == 'Q092')
        self.assertEqual(m['repeat_scope'], 'EACH_PARTNER_FAMILY')
        m = next(m for m in self.joint if m['question_id'] == 'Q100')
        b = next(o for o in m['option_candidates'] if o['code'] == 'B')
        self.assertIn('{data de revisão}', b['contract_template_candidate'])
        self.assertNotIn('experimental', b['contract_template_candidate'])
        p = self.protocols['P07']['parameters']
        self.assertEqual(p['trigger_protocol_id'], 'P03')
        self.assertFalse(p['independent_30_day_trigger'])

    def test_promoted_prompts_are_exact_source_text(self):
        records = load('fontes/enunciados_reconciliados_1_2_0.json')
        self.assertEqual(len(records), 32)
        for r in records:
            self.assertEqual(self.q[r['question_id']]['prompt_text'], r['promoted_source']['text'])
            self.assertEqual(self.q[r['question_id']]['prompt_source_ref'], r['promoted_source']['source_ref'])

    def test_sources_do_not_enable_production(self):
        self.assertEqual(len(load('dados/correcoes_canonicas_5_0.json')), 32)
        self.assertTrue(load('dados/regras_globais.json')['canonical_5_available'])
        self.assertTrue(all(not q['is_active'] for q in self.q.values()))
        self.assertFalse(load('auditoria/cobertura.json')['production_ready'])

if __name__ == '__main__':
    unittest.main()
