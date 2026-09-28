import json
import os

def test_phase_6237_verification_gate():
    report_path = os.path.join(os.path.dirname(__file__), '..', 'reports', 'phase-6.2.37-blocker-delta.json')
    assert os.path.exists(report_path)
    with open(report_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data['safety_invariants']['production_db_mutated'] is False
    assert data['safety_invariants']['learner_ready_count'] == 83
    assert data['safety_invariants']['overall_readiness'] == 'NOT_READY'
    assert data['safety_invariants']['user_testing_authorized'] is False
