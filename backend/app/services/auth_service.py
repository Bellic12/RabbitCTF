"""
Authentication service for RabbitCTF.
"""

from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.user_credential import UserCredential
from app.models.role import Role
from app.schemas.auth import UserCreate, UserLogin, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: Session):
        """
        Initialize auth service.

        Args:
            db: Database session
        """
        self.db = db

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user with username and password.

        Args:
            username: User's username
            password: User's plain password

        Returns:
            User object if authentication successful, None otherwise
        """
        # Get user by username
        user = self.db.query(User).filter(User.username == username).first()
        if not user:
            return None

        # Get user credentials
        credential = (
            self.db.query(UserCredential)
            .filter(UserCredential.user_id == user.id)
            .first()
        )
        if not credential:
            return None

        # Verify password
        if not verify_password(password, credential.password_hash):
            return None

        return user

    def login(self, login_data: UserLogin) -> Token:
        """
        Login a user and return access token.

        Args:
            login_data: Login credentials

        Returns:
            Token with access token

        Raises:
            HTTPException: If credentials are invalid
        """
        # Authenticate user
        user = self.authenticate_user(login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token with user role name
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user.id,
                "username": user.username,
                "role": user.role.name,  # Include role name (admin, moderator, user)
            },
            expires_delta=access_token_expires,
        )

        return Token(access_token=access_token, token_type="bearer")

    def register(self, user_data: UserCreate) -> User:
        """
        Register a new user.

        Args:
            user_data: User registration data

        Returns:
            Created user

        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username already exists
        existing_user = (
            self.db.query(User).filter(User.username == user_data.username).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )

        # Check if email already exists
        existing_email = (
            self.db.query(User).filter(User.email == user_data.email).first()
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Get default user role
        user_role = self.db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Default user role not found",
            )

        # Create new user
        new_user = User(
            username=user_data.username, email=user_data.email, role_id=user_role.id
        )
        self.db.add(new_user)
        self.db.flush()  # Flush to get user.id

        # Create user credentials
        hashed_password = get_password_hash(user_data.password)
        user_credential = UserCredential(
            user_id=new_user.id,
            password_hash=hashed_password,
            is_temp_password=False,
            must_change_password=False,
        )
        self.db.add(user_credential)

        # Commit transaction
        self.db.commit()
        self.db.refresh(new_user)

        return new_user

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User object or None if not found
        """
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.

        Args:
            username: Username

        Returns:
            User object or None if not found
        """
        return self.db.query(User).filter(User.username == username).first()
