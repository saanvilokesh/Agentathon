import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main as api
from fastapi.testclient import TestClient


def test_database_history_and_topic_progress(tmp_path, monkeypatch):
    monkeypatch.setattr(api, "DB_PATH", tmp_path / "test.db")
    payload = api.RunPayload(
        code="def solve(nums):\\n    return nums",
        language="Python3",
        title="Linked List traversal",
        slug="linked-list-traversal"
    )
    result = {
        "status": "bug_found",
        "topic": "Linked Lists",
        "error_category": "off_by_one",
        "error_location": {"line": 2},
        "mutated_snippet": "def solve(nums):\\n    return nums[1:]",
        "reason": "Boundary error",
        "custom_explanation": "The first element is skipped."
    }

    with TestClient(api.app) as client:
        run_id, _ = api.store_analysis(payload, result)
        history = client.get("/history").json()
        progress = client.get("/progress").json()

    assert history["items"][0]["id"] == run_id
    assert history["items"][0]["topic"] == "Linked Lists"
    assert progress["total_analyses"] == 1
    assert progress["total_bugged_attempts"] == 1
    assert progress["topics"][0]["progress_tag"] == "Needs practice"
