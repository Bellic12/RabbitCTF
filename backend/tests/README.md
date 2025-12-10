# RabbitCTF Backend Testing Suite

This directory contains the automated testing suite for the RabbitCTF backend. The tests are built using `pytest` and are organized into **Unit Tests** and **Integration Tests**.

## Directory Structure

```
tests/
├── conftest.py          # Global pytest configuration and fixtures
├── test_connection.py   # Database connection verification script
├── unit/                # Tests for isolated logic (no DB/API required)
└── integration/         # Tests involving Database and API interactions
```

## 1. Unit Tests (`tests/unit/`)

These tests verify individual components in isolation. They are fast and do not require a running database or API server.

| File | What it Tests | How it Tests |
|------|---------------|--------------|
| `test_security.py` | **Security Utilities** | • Verifies that `get_password_hash` creates valid hashes.<br>• Verifies that `verify_password` correctly matches passwords.<br>• Checks that `create_access_token` generates valid JWTs with correct payloads. |
| `test_models_basic.py` | **SQLAlchemy Models** | • Instantiates model classes (`User`, `Team`) in memory.<br>• Verifies that attributes are set correctly upon initialization.<br>• Ensures basic object integrity without hitting the DB. |
| `test_models_script.py` | **Model Metadata** | • Checks that all expected tables are defined in the SQLAlchemy metadata.<br>• Verifies the importability of all model classes. |

## 2. Integration Tests (`tests/integration/`)

These tests verify the interaction between different parts of the system, including the API, the Database, and the Business Logic services. They use a real (or containerized) PostgreSQL database.

| File | What it Tests | How it Tests |
|------|---------------|--------------|
| `test_api_auth.py` | **Authentication Flow** | • **Register**: Sends a POST request to `/api/v1/auth/register` with valid user data (including strong password).<br>• **Login**: Sends a POST request to `/api/v1/auth/login` with the created credentials.<br>• **Token**: Verifies that the login response contains a valid Bearer token. |
| `test_endpoints.py` | **API Endpoints** | • **Scoreboard**: Verifies `/api/v1/scoreboard` returns a 200 OK and the correct JSON structure (`teams` list).<br>• **Security**: Verifies that protected endpoints (e.g., `/api/v1/admin/stats`) return `401 Unauthorized` when accessed without a token. |
| `test_dynamic_scoring.py` | **Scoring Logic** | • Simulates a full CTF scenario in the database.<br>• Creates challenges, teams, and submissions.<br>• Verifies that challenge points decrease dynamically as more teams solve them (Dynamic Scoring). |
| `test_login_script.py` | **Auth Service** | • Directly tests the `AuthService` class against the database.<br>• Verifies login success with correct credentials and failure with incorrect ones. |
| `test_roles_script.py` | **RBAC (Roles)** | • Verifies that users can be assigned roles (Admin, User).<br>• Checks permission logic associated with different roles. |

## Configuration (`conftest.py`)

This file defines shared **fixtures** used across the test suite:

*   **`db`**: Provides a SQLAlchemy database session (`SessionLocal`) for tests that need direct DB access.
*   **`client`**: Provides a FastAPI `TestClient`. This allows us to make HTTP requests to the API (e.g., `client.get("/...")`) without running a separate server process.

## How to Run Tests

Run all tests:
```bash
pytest
```

Run only unit tests:
```bash
pytest tests/unit
```

Run only integration tests:
```bash
pytest tests/integration
```
