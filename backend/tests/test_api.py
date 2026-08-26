from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200


def test_dashboard_rejects_invalid_month():
    response = client.get("/dashboard", params={"month": "2026-99"})
    assert response.status_code == 422


def test_budget_summary_rejects_invalid_month():
    response = client.get("/budgets/summary", params={"month": "2026-99"})
    assert response.status_code == 422
