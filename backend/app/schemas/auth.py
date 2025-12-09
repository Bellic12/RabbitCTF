"""
Authentication and User schemas for RabbitCTF.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
import re


# =============================================
# USER SCHEMAS
# =============================================


class UserBase(BaseModel):
    """Base user schema with common fields."""

    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_-]+$",
        description="Username (alphanumeric, underscore, hyphen only)",
        examples=["alice_ctf", "bob123", "team-leader"],
    )
    email: EmailStr = Field(
        ..., description="Valid email address", examples=["user@example.com"]
    )


class UserCreate(UserBase):
    """Schema for user registration."""

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (minimum 8 characters)",
        examples=["SecurePass123!"],
    )
    password_confirm: str = Field(
        ...,
        description="Password confirmation (must match password)",
        examples=["SecurePass123!"],
    )

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("password_confirm")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        """Validate that passwords match."""
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if v.lower() in ["admin", "root", "system", "captain", "ctf"]:
            raise ValueError("This username is reserved")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""

    username: str = Field(
        ..., min_length=3, max_length=50, description="Username", examples=["alice_ctf"]
    )
    password: str = Field(
        ..., min_length=1, description="Password", examples=["SecurePass123!"]
    )


class UserResponse(UserBase):
    """Schema for user response (public data only)."""

    id: int
    role_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserDetailResponse(UserResponse):
    """Schema for detailed user response including role info."""

    role_name: Optional[str] = None
    team_id: Optional[int] = None
    team_name: Optional[str] = None
    is_team_captain: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for updating user information."""

    email: Optional[EmailStr] = Field(
        None, description="New email address", examples=["newemail@example.com"]
    )
    current_password: Optional[str] = Field(
        None,
        description="Current password (required to change password)",
        examples=["OldPass123!"],
    )
    new_password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=128,
        description="New password (minimum 8 characters)",
        examples=["NewPass456!"],
    )
    new_password_confirm: Optional[str] = Field(
        None, description="New password confirmation", examples=["NewPass456!"]
    )

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: Optional[str]) -> Optional[str]:
        """Validate new password strength if provided."""
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""

    email: EmailStr = Field(
        ..., description="Email address of the account", examples=["user@example.com"]
    )


class PasswordReset(BaseModel):
    """Schema for password reset with token."""

    token: str = Field(
        ...,
        description="Password reset token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password",
        examples=["NewSecurePass123!"],
    )
    new_password_confirm: str = Field(
        ..., description="New password confirmation", examples=["NewSecurePass123!"]
    )


# =============================================
# TOKEN SCHEMAS
# =============================================


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str = Field(
        ...,
        description="JWT access token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )
    token_type: str = Field(
        default="bearer", description="Token type", examples=["bearer"]
    )


class TokenData(BaseModel):
    """Schema for token payload data."""

    user_id: Optional[int] = None
    username: Optional[str] = None
    role_id: Optional[int] = None
