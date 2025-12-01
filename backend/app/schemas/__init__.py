"""
Pydantic schemas for RabbitCTF platform.

This module exports all schemas organized by domain:
- Authentication & Users: Login, registration, user management
- Teams: Team creation, joining, management
- Challenges: Challenge CRUD, categories, file uploads
- Submissions: Flag submissions, statistics, blocks
- Common: Events, notifications, audit logs, utilities
"""

# Authentication & Users
from app.schemas.auth import (
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    UserDetailResponse,
    UserUpdate,
    PasswordResetRequest,
    PasswordReset,
    Token,
    TokenData,
)

# Teams
from app.schemas.teams import (
    TeamBase,
    TeamCreate,
    TeamJoin,
    TeamResponse,
    TeamMemberResponse,
    TeamDetailResponse,
    TeamUpdate,
    TeamLeaveRequest,
    TeamKickMember,
    TeamTransferCaptain,
    TeamLeaderboardEntry,
    TeamStatsResponse,
)

# Challenges
from app.schemas.challenges import (
    ChallengeCategoryBase,
    ChallengeCategoryCreate,
    ChallengeCategoryResponse,
    ChallengeBase,
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    ChallengeDetailResponse,
    ChallengeFileUpload,
    ChallengeFileResponse,
    FlagSubmit,
    FlagSubmitResponse,
    ChallengeListFilters,
    ChallengeListResponse,
)

# Submissions
from app.schemas.submissions import (
    SubmissionBase,
    SubmissionResponse,
    SubmissionDetailResponse,
    SubmissionHistoryResponse,
    SubmissionBlockResponse,
    UserSubmissionStatus,
    SubmissionStatsResponse,
    TeamSubmissionStats,
    FirstBloodResponse,
    SolveTimelineEntry,
    SolveTimelineResponse,
)

# Common (Events, Notifications, etc.)
from app.schemas.common import (
    EventConfigBase,
    EventConfigCreate,
    EventConfigResponse,
    NotificationBase,
    NotificationCreate,
    NotificationResponse,
    NotificationListResponse,
    AuditLogResponse,
    AuditLogListResponse,
    DifficultyResponse,
    RoleResponse,
    MessageResponse,
    ErrorResponse,
    PaginationMetadata,
)

# Export all schemas
__all__ = [
    # Auth & Users
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserDetailResponse",
    "UserUpdate",
    "PasswordResetRequest",
    "PasswordReset",
    "Token",
    "TokenData",
    # Teams
    "TeamBase",
    "TeamCreate",
    "TeamJoin",
    "TeamResponse",
    "TeamMemberResponse",
    "TeamDetailResponse",
    "TeamUpdate",
    "TeamLeaveRequest",
    "TeamKickMember",
    "TeamTransferCaptain",
    "TeamLeaderboardEntry",
    "TeamStatsResponse",
    # Challenges
    "ChallengeCategoryBase",
    "ChallengeCategoryCreate",
    "ChallengeCategoryResponse",
    "ChallengeBase",
    "ChallengeCreate",
    "ChallengeUpdate",
    "ChallengeResponse",
    "ChallengeDetailResponse",
    "ChallengeFileUpload",
    "ChallengeFileResponse",
    "FlagSubmit",
    "FlagSubmitResponse",
    "ChallengeListFilters",
    "ChallengeListResponse",
    # Submissions
    "SubmissionBase",
    "SubmissionResponse",
    "SubmissionDetailResponse",
    "SubmissionHistoryResponse",
    "SubmissionBlockResponse",
    "UserSubmissionStatus",
    "SubmissionStatsResponse",
    "TeamSubmissionStats",
    "FirstBloodResponse",
    "SolveTimelineEntry",
    "SolveTimelineResponse",
    # Common
    "EventConfigBase",
    "EventConfigCreate",
    "EventConfigResponse",
    "NotificationBase",
    "NotificationCreate",
    "NotificationResponse",
    "NotificationListResponse",
    "AuditLogResponse",
    "AuditLogListResponse",
    "DifficultyResponse",
    "RoleResponse",
    "MessageResponse",
    "ErrorResponse",
    "PaginationMetadata",
]
