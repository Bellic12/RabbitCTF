# Test Suite (Quality Assurance)

This directory contains the automated tests that verify the correctness of the application logic. We use **pytest** as the testing framework.

## Testing Strategy

We employ a mix of **Unit Tests** (testing isolated components) and **Integration Tests** (testing the interaction between API, Service, and Database).

### Critical Test Scenarios
- **`test_dynamic_scoring_integration.py`**:
  - **Business Logic**: Simulates multiple teams solving the same challenge.
  - **Outcome**: Verifies that the points awarded decrease according to the mathematical formula defined in `core/scoring.py`.

- **`test_event_time_integration.py`**:
  - **Business Logic**: Tests the state machine of the event (Not Started -> Active -> Finished).
  - **Outcome**: Ensures the system automatically transitions states based on the configured start/end times.

- **`test_login.py`**:
  - **Security**: Verifies that only valid credentials yield a JWT token.

## Running Tests

### From Docker (Recommended)
To run tests in the same environment as the application:
```bash
docker exec -it rabbitctf_backend_dev pytest
```

### Local Development
```bash
# Install test dependencies
pip install pytest httpx

# Run all tests
pytest

# Run a specific test file with verbose output
pytest tests/test_submission_restrictions.py -v -s
```
# or for a specific test file
pytest tests/test_submission_restrictions.py
```

If you want to execute a tests inside the container of Docker, you must execute the next command
```bash
docker exec -it rabbitctf_backend_dev sh -c "pip install httpx && pytest tests/test_submission_restrictions.py -v -s"
```
