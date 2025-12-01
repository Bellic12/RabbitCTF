"""
Additional schemas for events, notifications, and system management.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# =============================================
# EVENT CONFIG SCHEMAS
# =============================================

class EventConfigBase(BaseModel):
    """Base event configuration schema."""
    event_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Event name",
        examples=["RabbitCTF 2025"]
    )


class EventConfigCreate(EventConfigBase):
    """Schema for creating event configuration."""
    start_time: Optional[datetime] = Field(
        None,
        description="Event start time",
        examples=["2025-12-01T00:00:00Z"]
    )
    end_time: Optional[datetime] = Field(
        None,
        description="Event end time",
        examples=["2025-12-31T23:59:59Z"]
    )
    max_team_size: int = Field(
        default=4,
        ge=1,
        le=10,
        description="Maximum team size",
        examples=[4]
    )
    max_submission_attempts: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Maximum submission attempts per challenge",
        examples=[5]
    )


class EventConfigResponse(EventConfigBase):
    """Schema for event configuration response."""
    id: int
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    status: str
    max_team_size: int
    max_submission_attempts: int
    submission_time_window_seconds: int
    submission_block_minutes: int
    event_timezone: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# NOTIFICATION SCHEMAS
# =============================================

class NotificationBase(BaseModel):
    """Base notification schema."""
    title: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Notification title",
        examples=["System Maintenance"]
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Notification message",
        examples=["The platform will be under maintenance..."]
    )


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    type: str = Field(
        ...,
        pattern=r'^(info|warning|success|error)$',
        description="Notification type: info, warning, success, or error",
        examples=["info"]
    )
    is_published: bool = Field(
        default=True,
        description="Whether to publish immediately",
        examples=[True]
    )


class NotificationResponse(NotificationBase):
    """Schema for notification response."""
    id: int
    type: str
    is_published: bool
    created_by: int
    created_at: datetime
    published_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    """Schema for notification list."""
    total: int
    notifications: List[NotificationResponse]
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# AUDIT LOG SCHEMAS
# =============================================

class AuditLogResponse(BaseModel):
    """Schema for audit log entry."""
    id: int
    user_id: Optional[int]
    username: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[int]
    details: Optional[dict]
    ip_address: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    """Schema for audit log list."""
    total: int
    logs: List[AuditLogResponse]
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# DIFFICULTY SCHEMAS
# =============================================

class DifficultyResponse(BaseModel):
    """Schema for difficulty level response."""
    id: int
    name: str
    sort_order: int
    description: Optional[str]
    challenge_count: Optional[int] = Field(
        default=0,
        description="Number of challenges with this difficulty"
    )
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# ROLE SCHEMAS
# =============================================

class RoleResponse(BaseModel):
    """Schema for role response."""
    id: int
    name: str
    description: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# COMMON RESPONSE SCHEMAS
# =============================================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str = Field(
        ...,
        description="Response message",
        examples=["Operation completed successfully"]
    )
    success: bool = Field(
        default=True,
        description="Whether the operation was successful",
        examples=[True]
    )


class ErrorResponse(BaseModel):
    """Generic error response."""
    detail: str = Field(
        ...,
        description="Error detail message",
        examples=["Invalid credentials"]
    )
    error_code: Optional[str] = Field(
        None,
        description="Error code for client handling",
        examples=["AUTH_001"]
    )


class PaginationMetadata(BaseModel):
    """Pagination metadata for list responses."""
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number", ge=1)
    per_page: int = Field(..., description="Items per page", ge=1, le=100)
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_prev: bool = Field(..., description="Whether there is a previous page")
