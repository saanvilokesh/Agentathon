import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analysis import complexity,_diff,validate
from main import RunPayload
import pytest

def test_metrics_bounds():
    m=complexity('if (a) {\nfor (int i=0;i<2;i++) {}\n}')
    assert all(0<=v<=100 for v in m.values())
def test_diff():
    assert any(x[0]=='added' for x in _diff(['a'],['b']))
def test_empty_rejected():
    with pytest.raises(ValueError):validate(RunPayload(code='',title='Two Sum'))
def test_missing_problem_rejected():
    with pytest.raises(ValueError):validate(RunPayload(code='pass'))
