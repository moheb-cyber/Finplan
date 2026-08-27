from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "FinPlan" in response.text


def test_dashboard_requires_valid_month():
    response = client.get("/dashboard", params={"month": "2026-13"})

    assert response.status_code == 422


def test_budget_summary_requires_valid_month():
    response = client.get("/budgets/summary", params={"month": "invalid"})

    assert response.status_code == 422
