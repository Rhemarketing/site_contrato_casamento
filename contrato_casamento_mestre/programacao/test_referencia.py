import itertools,sqlite3,unittest
from pathlib import Path
from referencia import normalize_pair,project_shared_component,contribution_amount,EXCLUDED_REASONS,both_confirmed

class ReferenceTests(unittest.TestCase):
    def test_nine_ordered_arrangements_preserve_people(self):
        for a,b in itertools.product('ABC', repeat=2):
            p=normalize_pair('p1',a,'p2',b)
            self.assertEqual(p['pair_key'],''.join(sorted((a,b))))
            self.assertIn('p1',p['respondents_by_option'][a]);self.assertIn('p2',p['respondents_by_option'][b])
    def test_inapplicable_is_not_a(self):
        for v in (None,'NOT_APPLICABLE','NOT_ANSWERED','D'):
            with self.assertRaises(ValueError):normalize_pair('p1',v,'p2','A')
    def test_same_person_rejected(self):
        with self.assertRaises(ValueError):normalize_pair('p1','A','p1','B')
    def test_privacy_destinations_and_critical_safety(self):
        for privacy,target in itertools.product(('COMMON','PRIVATE','SAFETY_PRIVATE',None),('CONTRACT','JOINT_PLAN','PRIVATE_PLAN','INTERNAL','NONE',None)):
            c={'component_id':'x','version':'1','contract_template':'texto','status':'APPROVED','privacy_class':privacy,'output_target':target,'secret':'não copiar'}
            out=project_shared_component(c)
            if privacy=='COMMON' and target=='CONTRACT':self.assertEqual(set(out),{'component_id','version','contract_template'})
            else:self.assertIsNone(out)
            self.assertIsNone(project_shared_component(c,critical_safety=True))
    def test_unapproved_candidate_cannot_render(self):
        self.assertIsNone(project_shared_component({'privacy_class':'COMMON','output_target':'CONTRACT','status':'DRAFT','contract_template':'texto'}))
    def test_contribution_exclusions_and_unknown_context(self):
        c={'rule':'GENERAL_PROCESS_REFUSAL','aware_of_process':True,'reasonable_communication_conditions':True,'explicit_or_deliberate_refusal':True,'expired_valid_deadline':True,'no_legitimate_impediment':True,'eligible_process_rule_confirmed':True,'no_exclusion_reason':True,'safety_cleared':True,'exclusion_reasons':[]}
        self.assertEqual(str(contribution_amount(c)),'10.00')
        for reason in EXCLUDED_REASONS|{'unknown_reason_requiring_review'}:
            self.assertEqual(str(contribution_amount(dict(c,exclusion_reasons=[reason]))),'0.00')
        for k in ('aware_of_process','reasonable_communication_conditions','explicit_or_deliberate_refusal','expired_valid_deadline','no_legitimate_impediment','eligible_process_rule_confirmed'):
            missing=dict(c);del missing[k]
            self.assertEqual(str(contribution_amount(missing)),'0.00')
        self.assertEqual(str(contribution_amount(dict(c,critical_safety=True))),'0.00')
        self.assertEqual(str(contribution_amount({'expired_valid_deadline':True})),'0.00')
    def test_confirmation_requires_two_distinct_members_current_hash(self):
        self.assertFalse(both_confirmed(['a','b'],'v2',[{'member_id':'a','hash':'v2'},{'member_id':'a','hash':'v2'}]))
        self.assertFalse(both_confirmed(['a','b'],'v2',[{'member_id':'a','hash':'v1'},{'member_id':'b','hash':'v2'}]))
        self.assertTrue(both_confirmed(['a','b'],'v2',[{'member_id':'a','hash':'v2'},{'member_id':'b','hash':'v2'}]))
    def test_sql_schema_and_private_shared_constraint(self):
        db=sqlite3.connect(':memory:')
        db.executescript(Path(__file__).with_name('modelo_referencia.sql').read_text())
        for privacy in ('PRIVATE','SAFETY_PRIVATE'):
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute('INSERT INTO output_components(component_id,version,privacy_class,output_target,source_ref_json) VALUES(?,?,?,?,?)',('x','1',privacy,'CONTRACT','{}'))
        db.execute('INSERT INTO output_components(component_id,version,privacy_class,output_target,source_ref_json) VALUES(?,?,?,?,?)',('ok','1','PRIVATE','PRIVATE_PLAN','{}'))
        db.close()

if __name__=='__main__':unittest.main()
