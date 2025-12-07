"""
Authentication endpoints for RabbitCTF.
"""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    - **username**: Unique username (3-50 chars, alphanumeric)
    - **email**: Valid email address
    - **password**: Password (minimum 8 chars, must contain uppercase, lowercase, and digit)
    - **password_confirm**: Password confirmation (must match password)

    Returns the created user without sensitive data.
    """
    auth_service = AuthService(db)
    user = auth_service.register(user_data)
    return user


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login and get access token.

    - **username**: Your username
    - **password**: Your password

    Returns a JWT access token to use in subsequent requests.
    Add it to requests as: `Authorization: Bearer <token>`
    """
    auth_service = AuthService(db)
    token = auth_service.login(login_data)
    return token


@router.post("/token", response_model=Token)
async def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login.

    This endpoint is compatible with OAuth2 password flow.
    Used by Swagger UI's "Authorize" button.

    Returns a JWT access token.
    """
    auth_service = AuthService(db)

    # Create UserLogin from OAuth2 form data
    login_data = UserLogin(username=form_data.username, password=form_data.password)
    token = auth_service.login(login_data)

    return token


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information.

    Requires authentication.
    Returns information about the currently logged-in user.
    """
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout endpoint.

    Since we're using JWT tokens (stateless), logout is handled client-side
    by removing the token. This endpoint is here for API completeness.

    In a production system, you might implement token blacklisting here.
    """
    return {"message": "Successfully logged out. Remove token from client."}
