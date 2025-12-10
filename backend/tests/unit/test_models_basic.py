from app.models.user import User
from app.models.team import Team

def test_user_model_instantiation():
    user = User(username="testuser", email="test@example.com")
    assert user.username == "testuser"
    assert user.email == "test@example.com"

def test_team_model_instantiation():
    team = Team(name="testteam")
    assert team.name == "testteam"
