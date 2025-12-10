import sys
from pathlib import Path

# Add the project root to sys.path so we can import 'app'
# This assumes conftest.py is in backend/tests/
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal

@pytest.fixture(scope="session")
def db() -> Generator:
    yield SessionLocal()

@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c
