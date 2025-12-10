import pytest
from fastapi.testclient import TestClient

def test_register_and_login(client: TestClient):
    # 1. Register a new user
    # Password must meet complexity requirements: 8+ chars, 1 upper, 1 lower, 1 digit
    password = "TestPassword123!"
    
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    username = f"user_{unique_id}"
    email = f"user_{unique_id}@test.com"

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": username,
            "email": email,
            "password": password,
            "password_confirm": password,
        },
    )
    
    # If registration is not open or fails, we might need to handle it.
    # Assuming registration is open.
    if response.status_code in [200, 201]:
        assert response.json()["username"] == username
    elif response.status_code == 403:
        pytest.skip("Registration is closed or restricted")
    else:
        pytest.fail(f"Registration failed with status {response.status_code}: {response.text}")
    
    # 2. Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": username,
            "password": password
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
