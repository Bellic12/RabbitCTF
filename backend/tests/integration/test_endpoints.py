from fastapi.testclient import TestClient

def test_get_scoreboard(client: TestClient):
    response = client.get("/api/v1/scoreboard")
    # It might be 200 or 404 if not implemented, but based on router it should be there.
    # If it redirects (307), client follows by default? No, TestClient doesn't follow redirects by default unless configured?
    # Actually TestClient follows redirects by default.
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "teams" in data
    assert isinstance(data["teams"], list)

def test_get_admin_stats_unauthorized(client: TestClient):
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 401
