from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.core.database import get_db
from app.core.audit import log_audit
from app.schemas.teams import TeamCreate, TeamJoin, TeamResponse
from app.services.team_service import TeamService

router = APIRouter()

@router.post("/", response_model=TeamResponse)
def create_team(
    team_in: TeamCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new team.
    """
    team_service = TeamService(db)
    team = team_service.create_team(team_in, current_user)
    
    # Log team creation
    log_audit(
        db=db,
        user_id=current_user.id,
        action="CREATE",
        resource_type="team",
        resource_id=team.id,
        details={"action": "created_team", "team_name": team.name},
        request=request
    )
    
    return team

@router.post("/join", response_model=TeamResponse)
def join_team(
    team_in: TeamJoin,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Join an existing team.
    """
    team_service = TeamService(db)
    team = team_service.join_team(team_in, current_user)
    
    # Log team join
    log_audit(
        db=db,
        user_id=current_user.id,
        action="UPDATE",
        resource_type="team",
        resource_id=team.id,
        details={"action": "joined_team", "team_name": team.name},
        request=request
    )
    
    return team
