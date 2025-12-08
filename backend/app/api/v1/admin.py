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
from app.schemas.admin import AdminStatsResponse

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
