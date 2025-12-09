"""
Shared dependencies for API endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.role import Role

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        token: JWT token from Authorization header
        db: Database session

    Returns:
        Current authenticated user

    Raises:
        HTTPException: If credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # Get user_id from token
    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user.

    Args:
        current_user: Current authenticated user

    Returns:
        Current active user

    Raises:
        HTTPException: If user is inactive
    """
    # Add any additional checks here if you have an is_active field
    return current_user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure current user is an admin.

    Args:
        current_user: Current authenticated user

    Returns:
        Current admin user

    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin role required.",
        )

    return current_user


async def get_current_captain_or_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensure current user is a captain or admin.

    Args:
        current_user: Currently authenticated user

    Returns:
        Current captain or admin user

    Raises:
        HTTPException: If user is not a captain or admin
    """
    if current_user.role.name not in ["admin", "captain"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Captain or Admin role required.",
        )

    return current_user


def require_role(allowed_roles: list[str]):
    """
    Custom dependency factory to check multiple roles.

    Usage:
        @router.get("/", dependencies=[Depends(require_role(["admin", "captain"]))])

    Args:
        allowed_roles: List of role names that are allowed

    Returns:
        Dependency function that checks user role
    """

    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker
