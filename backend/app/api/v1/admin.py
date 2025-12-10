"""
Admin-only endpoints for RabbitCTF.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.schemas.auth import UserResponse
from app.models.user import User
from app.models.team import Team
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.models.event_config import EventConfig
from app.schemas.admin import AdminStatsResponse
from app.schemas.event import EventConfigResponse, EventConfigUpdate
from app.core.enum import EventStatus
from datetime import datetime, timezone, timedelta

router = APIRouter()


@router.get("/event/config", response_model=EventConfigResponse)
async def get_event_config(
    current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)
):
    """
    Get event configuration.
    Automatically updates status based on current time.
    """
    config = db.query(EventConfig).first()
    if not config:
        # Create default config if not exists
        config = EventConfig(event_name="RabbitCTF Event")
        db.add(config)
        db.commit()
        db.refresh(config)
    
    # Auto-update status based on time
    now = datetime.now(timezone.utc)
    changed = False
    
    if config.start_time and config.end_time:
        # Ensure datetimes are timezone-aware for comparison
        start_time = config.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
            
        end_time = config.end_time
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)

        # Check if we should start
        if config.status == EventStatus.NOT_STARTED and now >= start_time:
            if now < end_time:
                config.status = EventStatus.ACTIVE
                changed = True
            elif now >= end_time:
                config.status = EventStatus.FINISHED
                changed = True
        
        # Check if we should finish
        elif config.status == EventStatus.ACTIVE and now >= end_time:
            config.status = EventStatus.FINISHED
            changed = True
            
    if changed:
        db.commit()
        db.refresh(config)
        
    return config


@router.put("/event/config", response_model=EventConfigResponse)
async def update_event_config(
    config_in: EventConfigUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update event configuration with validations.
    """
    config = db.query(EventConfig).first()
    if not config:
        config = EventConfig(event_name="RabbitCTF Event")
        db.add(config)
        db.commit()
        db.refresh(config)
    
    now = datetime.now(timezone.utc)
    update_data = config_in.dict(exclude_unset=True)
    
    # Handle manual status override - Adjust times to match requested status
    if 'status' in update_data:
        new_status = update_data['status']
        
        # Get working copies of times
        w_start = update_data.get('start_time', config.start_time)
        w_end = update_data.get('end_time', config.end_time)
        
        # Ensure timezone awareness
        if w_start and w_start.tzinfo is None:
            w_start = w_start.replace(tzinfo=timezone.utc)
        if w_end and w_end.tzinfo is None:
            w_end = w_end.replace(tzinfo=timezone.utc)
            
        # Default times if missing
        if not w_start: w_start = now + timedelta(hours=1)
        if not w_end: w_end = w_start + timedelta(hours=1)

        if new_status == EventStatus.ACTIVE:
            # Must have started and not ended
            if w_start > now:
                w_start = now
            if w_end <= now:
                w_end = now + timedelta(hours=1)
                
        elif new_status == EventStatus.FINISHED:
            # Must have ended
            if w_end > now:
                w_end = now
            if w_start > w_end:
                w_start = w_end - timedelta(minutes=5)
                
        elif new_status == EventStatus.NOT_STARTED:
            # Must not have started
            if w_start <= now:
                w_start = now + timedelta(hours=1)
            if w_end <= w_start:
                w_end = w_start + timedelta(hours=1)
        
        # Update the update_data with adjusted times
        update_data['start_time'] = w_start
        update_data['end_time'] = w_end

    # Validation 1: Removed to allow admins to reschedule events even if they started
    # if 'start_time' in update_data and update_data['start_time']:
    #     if config.start_time:
    #         # Ensure config.start_time is timezone-aware
    #         current_start_time = config.start_time
    #         if current_start_time.tzinfo is None:
    #             current_start_time = current_start_time.replace(tzinfo=timezone.utc)
    #             
    #         if now >= current_start_time:
    #             raise HTTPException(
    #                 status_code=status.HTTP_400_BAD_REQUEST,
    #                 detail="Cannot modify start time after the event has already started"
    #             )
    
    # Validation 2: Ensure end_time is after start_time
    new_start_time = update_data.get('start_time', config.start_time)
    new_end_time = update_data.get('end_time', config.end_time)
    
    # Ensure comparisons use timezone-aware datetimes
    if new_start_time and new_start_time.tzinfo is None:
        new_start_time = new_start_time.replace(tzinfo=timezone.utc)
        
    if new_end_time and new_end_time.tzinfo is None:
        new_end_time = new_end_time.replace(tzinfo=timezone.utc)
    
    if new_start_time and new_end_time:
        if new_end_time <= new_start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End time must be after start time"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(config, field, value)
    
    # Auto-update status based on new times
    if config.start_time and config.end_time:
        # Ensure datetimes are timezone-aware for comparison
        check_start = config.start_time
        if check_start.tzinfo is None:
            check_start = check_start.replace(tzinfo=timezone.utc)
            
        check_end = config.end_time
        if check_end.tzinfo is None:
            check_end = check_end.replace(tzinfo=timezone.utc)
            
        if now >= check_end:
            config.status = EventStatus.FINISHED
        elif now >= check_start:
            config.status = EventStatus.ACTIVE
        else:
            config.status = EventStatus.NOT_STARTED
    
    db.commit()
    db.refresh(config)
    return config


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
