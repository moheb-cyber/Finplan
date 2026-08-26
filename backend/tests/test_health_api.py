

def test_root_health_response(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "FinPlan API is running"}
