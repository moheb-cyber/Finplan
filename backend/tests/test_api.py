from datetime import datetime


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "FinPlan API is running"


def test_dashboard_rejects_invalid_month(client):
    response = client.get("/dashboard", params={"month": "2026-99"})
    assert response.status_code == 422


def test_budget_summary_rejects_invalid_month(client):
    response = client.get("/budgets/summary", params={"month": "2026-99"})
    assert response.status_code == 422


def test_month_range_handles_december():
    from backend.main import get_month_range

    start, end = get_month_range("2026-12")
    assert start == datetime(2026, 12, 1)
    assert end == datetime(2027, 1, 1)


def test_month_range_handles_regular_month():
    from backend.main import get_month_range

    start, end = get_month_range("2026-08")
    assert start == datetime(2026, 8, 1)
    assert end == datetime(2026, 9, 1)
