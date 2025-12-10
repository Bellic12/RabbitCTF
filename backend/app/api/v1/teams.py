from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from typing import Any, Optional

from app.api import deps
from app.core.database import get_db
from app.core.audit import log_audit
from app.schemas.teams import TeamCreate, TeamJoin, TeamResponse, TeamDetailResponse
from app.services.team_service import TeamService

router = APIRouter()

@router.get("/me", response_model=Optional[TeamDetailResponse])
def get_my_team(
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user's team details.
    """
    team_service = TeamService(db)
    return team_service.get_user_team(current_user)

@router.get("/{team_id}", response_model=Optional[TeamDetailResponse])
def get_team_details(
    team_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Get team details by ID.
    """
    team_service = TeamService(db)
    team = team_service.get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

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


@router.post("/leave")
def leave_team(
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Leave current team.
    """
    team_service = TeamService(db)
    team_service.leave_team(current_user)
    return {"message": "Successfully left the team"}


@router.delete("/")
def delete_team(
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Delete current team (Captain only).
    """
    team_service = TeamService(db)
    team_service.delete_team(current_user)
    return {"message": "Team successfully deleted"}
