import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main as api
from fastapi.testclient import TestClient

client = TestClient(api.app)
TWO_SUM = """class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen:
                return [seen[target - n], i]
            seen[n] = i
"""


def post(**kw):
    body = {"code": TWO_SUM, "language": "Python3", "method": "twoSum", "args": [[2, 7, 11, 15], 9]}
    body.update(kw)
    return client.post("/verify", json=body)


def test_pass_with_trace(monkeypatch):
    monkeypatch.setenv("VERIFY_SANDBOX", "local")
    r = post(expected=[0, 1]).json()
    assert r["verified"] and r["matches_expected"] is True and r["output"] == [0, 1]
    assert r["steps"] and "line" in r["steps"][0]


def test_wrong_answer(monkeypatch):
    monkeypatch.setenv("VERIFY_SANDBOX", "local")
    r = post(expected=[1, 2]).json()
    assert r["verified"] and r["matches_expected"] is False


def test_no_expected(monkeypatch):
    monkeypatch.setenv("VERIFY_SANDBOX", "local")
    r = post().json()
    assert r["verified"] and r["matches_expected"] is None


def test_runtime_error_reports_line(monkeypatch):
    monkeypatch.setenv("VERIFY_SANDBOX", "local")
    r = post(code="class Solution:\n    def f(self):\n        return 1/0\n", method="f", args=[]).json()
    assert not r["verified"] and "ZeroDivisionError" in r["error"] and r["error_line"] == 3


def test_missing_method_and_infinite_loop(monkeypatch):
    monkeypatch.setenv("VERIFY_SANDBOX", "local")
    assert "no method" in post(method="nope").json()["error"]
    monkeypatch.setattr("verifier.TIMEOUT_SECONDS", 1)
    r = post(code="class Solution:\n    def f(self):\n        while True: pass\n", method="f", args=[]).json()
    assert not r["verified"] and "Time limit" in r["error"]


def test_rejects_non_python_and_bad_method():
    assert post(language="C++").status_code == 422
    assert post(method="a;b").status_code == 422
