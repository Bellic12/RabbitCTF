"""
Admin-only endpoints for RabbitCTF.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.schemas.auth import UserResponse
from app.schemas.teams import TeamResponse
from app.models.user import User
from app.models.team import Team
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.models.event_config import EventConfig
from app.schemas.admin import (
    AdminStatsResponse, 
    ChallengeStatsResponse, 
    ChallengeStatItem,
    EventConfigResponse,
    EventConfigUpdate
)

router = APIRouter()


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics.
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_teams = db.query(func.count(Team.id)).scalar()
    total_challenges = db.query(func.count(Challenge.id)).scalar()
    active_challenges = db.query(func.count(Challenge.id)).filter(~Challenge.is_draft).scalar()
    total_submissions = db.query(func.count(Submission.id)).scalar()
    correct_flags = db.query(func.count(Submission.id)).filter(Submission.is_correct).scalar()

    return AdminStatsResponse(
        total_users=total_users,
        total_teams=total_teams,
        total_challenges=total_challenges,
        active_challenges=active_challenges,
        total_submissions=total_submissions,
        correct_flags=correct_flags,
    )


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)
):
    """
    List all users (admin only).

    Requires admin role.
    Returns a list of all registered users.
    """
    users = db.query(User).all()
    return users


@router.get("/teams", response_model=List[TeamResponse])
async def list_all_teams(
    current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)
):
    """
    List all teams (admin only).
    """
    teams = db.query(Team).all()
    return teams


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Delete a user by ID (admin only).

    Requires admin role.
    Cannot delete yourself.
    """
    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    username = user.username
    db.delete(user)
    db.commit()

    return {"message": f"User {username} deleted successfully"}


@router.get("/config", response_model=EventConfigResponse)
async def get_event_config(
    current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)
):
    """
    Get event configuration.
    """
    config = db.query(EventConfig).first()
    if not config:
        # Create default config if not exists
        config = EventConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.put("/config", response_model=EventConfigResponse)
async def update_event_config(
    config_in: EventConfigUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Update event configuration.
    """
    config = db.query(EventConfig).first()
    if not config:
        config = EventConfig()
        db.add(config)
    
    update_data = config_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    return config

    return {"message": f"User '{username}' deleted successfully"}


@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)
):
    """
    Get platform statistics (admin only).

    Requires admin role.
    Returns various statistics about the platform.
    """
    from app.models.team import Team
    from app.models.challenge import Challenge
    from app.models.submission import Submission

    total_users = db.query(User).count()
    total_teams = db.query(Team).count()
    total_challenges = db.query(Challenge).count()
    total_submissions = db.query(Submission).count()

    return {
        "total_users": total_users,
        "total_teams": total_teams,
        "total_challenges": total_challenges,
        "total_submissions": total_submissions,
    }


@router.get("/stats/challenges", response_model=ChallengeStatsResponse)
async def get_challenge_stats(
    category_id: Optional[int] = None,
    difficulty_id: Optional[int] = None,
    team_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Get detailed challenge statistics with filtering.
    """
    # Base query for submissions
    query = db.query(Submission).join(Challenge)

    if category_id:
        query = query.filter(Challenge.category_id == category_id)
    if difficulty_id:
        query = query.filter(Challenge.difficulty_id == difficulty_id)
    if team_id:
        query = query.filter(Submission.team_id == team_id)
    if start_date:
        query = query.filter(Submission.submitted_at >= start_date)
    if end_date:
        query = query.filter(Submission.submitted_at <= end_date)

    total_attempts = query.count()
    successful_attempts = query.filter(Submission.is_correct == True).count()
    
    general_success_rate = 0.0
    if total_attempts > 0:
        general_success_rate = (successful_attempts / total_attempts) * 100

    average_attempts = 0.0
    if successful_attempts > 0:
        average_attempts = total_attempts / successful_attempts

    # Per challenge stats
    challenges_query = db.query(Challenge)
    if category_id:
        challenges_query = challenges_query.filter(Challenge.category_id == category_id)
    if difficulty_id:
        challenges_query = challenges_query.filter(Challenge.difficulty_id == difficulty_id)
        
    challenges = challenges_query.all()
    
    challenges_stats = []
    for challenge in challenges:
        c_query = db.query(Submission).filter(Submission.challenge_id == challenge.id)
        
        if team_id:
            c_query = c_query.filter(Submission.team_id == team_id)
        if start_date:
            c_query = c_query.filter(Submission.submitted_at >= start_date)
        if end_date:
            c_query = c_query.filter(Submission.submitted_at <= end_date)
            
        c_attempts = c_query.count()
        c_solves = c_query.filter(Submission.is_correct == True).count()
        
        c_success_rate = 0.0
        if c_attempts > 0:
            c_success_rate = (c_solves / c_attempts) * 100
            
        challenges_stats.append(ChallengeStatItem(
            id=challenge.id,
            title=challenge.title,
            category=challenge.category.name if challenge.category else "Unknown",
            difficulty=challenge.difficulty.name if challenge.difficulty else "Unknown",
            success_rate=c_success_rate,
            attempts=c_attempts,
            solves=c_solves
        ))
        
    return ChallengeStatsResponse(
        general_success_rate=general_success_rate,
        total_attempts=total_attempts,
        successful_attempts=successful_attempts,
        average_attempts=average_attempts,
        challenges_stats=challenges_stats
    )
