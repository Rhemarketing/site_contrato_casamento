import unittest
from planejar_combinacao import PairPlanner, evaluate_predicate

class PairPlanningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.planner = PairPlanner()

    def plan(self, q, a, b, **kw):
        return self.planner.plan(q,'pessoa-1',a,'pessoa-2',b,applicable=True,
                                 safety_cleared=True,**kw)

    def test_same_category_is_not_automatic_agreement(self):
        result = self.plan('Q051','A','A')
        self.assertEqual(result['action'],'OPEN_NOS_DECIDIMOS')
        self.assertIn('QUEUE_JOINT_MODULE_VALIDATION',[x['operation'] for x in result['operations']])
        self.assertNotIn('EXACT_PAIR_TEXT_MISSING',result['blockers'])
        self.assertIn('SELECT_PAIR_COMPONENT',[x['operation'] for x in result['operations']])
        self.assertFalse(result['production_release'])

    def test_roles_follow_answers_not_member_order(self):
        result = self.plan('Q005','C','A')
        self.assertEqual(result['bindings']['Nome A'],['pessoa-2'])
        self.assertEqual(result['bindings']['Nome C'],['pessoa-1'])
        self.assertEqual(result['bindings']['Nome 1'],'pessoa-1')

    def test_private_followup_goes_only_to_respondent(self):
        result = self.plan('Q081','A','C')
        private = next(x for x in result['operations'] if x['operation']=='OPEN_PRIVATE_MODULE')
        self.assertEqual(private['recipients'],['pessoa-2'])
        self.assertFalse(any('JOINT' in x['operation'] for x in result['operations']))
        self.assertNotIn('bindings',result)

    def test_safety_overrides_normal_comparison(self):
        for q,a,b in [('Q103','A','B'),('Q162','A','C')]:
            result = self.plan(q,a,b)
            self.assertEqual(result['action'],'SAFETY_FLOW')
            self.assertEqual(result['operations'][0]['protocol_id'],'P13')
        self.assertEqual(self.plan('Q005','A','B',critical_safety=True)['action'],'SAFETY_FLOW')
        self.assertEqual(self.plan('Q101','A','A')['action'],'NO_ADDITIONAL_OUTPUT')

    def test_unknown_context_is_not_false(self):
        node={'op':'all','items':[{'op':'any_answer','codes':['B','C']},{'op':'fact','name':'frequency_missing'}]}
        self.assertIsNone(evaluate_predicate(node,'AB',{}))
        self.assertFalse(evaluate_predicate(node,'AA',{}))
        r = self.plan('Q011','A','B')
        self.assertIn('CONTEXT_REQUIRED:COND-Q011',r['blockers'])
        r = self.plan('Q011','A','B',facts={'Q011_no_frequency_defined':True})
        self.assertIn('QUEUE_JOINT_MODULE_VALIDATION',[x['operation'] for x in r['operations']])

    def test_reproductive_divergence_not_sent_to_joint_vote(self):
        r=self.plan('Q146','C','A')
        self.assertEqual(r['action'],'TRIGGER_PROTOCOL')
        self.assertFalse(any('JOINT' in x['operation'] for x in r['operations']))
        self.assertEqual(r['operations'][0]['protocol_id'],'P09')

    def test_gambling_total_prohibition_selected(self):
        r=self.plan('Q154','A','B')
        self.assertEqual(r['action'],'MERGE_EXACT_TEXT')
        self.assertEqual(r['blockers'],[])
        c=self.planner.components['OUT-Q154-FIXED']
        self.assertIn('mesmo em pequenas quantias',c['template_candidate'])

    def test_gambling_harm_protection_does_not_wait_for_policy(self):
        result=self.plan('Q154','A','C')
        self.assertEqual(result['action'],'PRIVATE_DIAGNOSTIC')
        self.assertTrue(any(x.get('protocol_id')=='P10' for x in result['operations']))

    def test_registered_actions_and_missing_texts_remain_distinct(self):
        rules=list(self.planner.rules.values())
        self.assertEqual(len(rules),1200)
        missing=[r['pair_rule_id'] for r in rules if r['action'] is None]
        self.assertEqual(missing,[])
        self.assertEqual(sum('EXACT_PAIR_TEXT_MISSING' in r['execution_dependencies'] for r in rules),0)
        self.assertTrue(all(r['requires_runtime_inference'] is False for r in rules))

    def test_absence_cannot_become_a(self):
        with self.assertRaises(ValueError):
            self.plan('Q051','A','NOT_APPLICABLE')

if __name__=='__main__':
    unittest.main()
