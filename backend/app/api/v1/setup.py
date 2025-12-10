from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import field_validator
from app.core.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.user_credential import UserCredential
from app.schemas.auth import UserCreate
from app.core.security import get_password_hash


class SetupAdminCreate(UserCreate):
    """
    Schema for initial admin creation.
    Inherits from UserCreate but allows reserved usernames like 'admin'.
    """
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        # We allow 'admin' for the initial setup, bypassing the reserved word check
        return v


router = APIRouter()

@router.get("/status")
def check_setup_status(db: Session = Depends(get_db)):
    """
    Check if the initial setup is completed (i.e., if an admin exists).
    """
    # Find the admin role
    admin_role = db.execute(select(Role).where(Role.name == "admin")).scalar_one_or_none()
    if not admin_role:
        # If admin role doesn't exist, we can't have an admin user.
        # This might happen if seed data hasn't run, but let's assume roles exist.
        return {"is_setup_completed": False}

    # Check if any user has the admin role
    admin_user = db.execute(select(User).where(User.role_id == admin_role.id)).first()
    
    return {"is_setup_completed": admin_user is not None}

@router.post("/admin", status_code=status.HTTP_201_CREATED)
def create_initial_admin(user_in: SetupAdminCreate, db: Session = Depends(get_db)):
    """
    Create the initial administrator account.
    Only allowed if no administrator exists.
    """
    # 1. Check if setup is already completed
    admin_role = db.execute(select(Role).where(Role.name == "admin")).scalar_one_or_none()
    if not admin_role:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin role not found. Database might not be seeded."
        )

    existing_admin = db.execute(select(User).where(User.role_id == admin_role.id)).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Setup already completed. Administrator exists."
        )

    # 2. Validate password match
    if user_in.password != user_in.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # 3. Check if username or email taken
    existing_user = db.execute(
        select(User).where((User.username == user_in.username) | (User.email == user_in.email))
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # 4. Create the admin user
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        role_id=admin_role.id   
    )
    db.add(new_user)
    db.flush() # to get ID

    # 5. Create credentials
    hashed_password = get_password_hash(user_in.password)
    credentials = UserCredential(
        user_id=new_user.id,
        password_hash=hashed_password
    )
    db.add(credentials)
    
    db.commit()
    db.refresh(new_user)

    return {"message": "Administrator created successfully"}
