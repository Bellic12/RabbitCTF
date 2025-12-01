"""
Admin-only endpoints for RabbitCTF.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.schemas.auth import UserResponse
from app.models.user import User

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    username = user.username
    db.delete(user)
    db.commit()
    
    return {"message": f"User '{username}' deleted successfully"}


@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
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
        "total_submissions": total_submissions
    }
