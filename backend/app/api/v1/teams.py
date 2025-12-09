from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.core.database import get_db
from app.schemas.teams import TeamCreate, TeamJoin, TeamResponse
from app.services.team_service import TeamService

router = APIRouter()

@router.post("/", response_model=TeamResponse)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new team.
    """
    team_service = TeamService(db)
    return team_service.create_team(team_in, current_user)

@router.post("/join", response_model=TeamResponse)
def join_team(
    team_in: TeamJoin,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Join an existing team.
    """
    team_service = TeamService(db)
    return team_service.join_team(team_in, current_user)
