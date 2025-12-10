"""
Challenge schemas for RabbitCTF.
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime


# =============================================
# CHALLENGE CATEGORY SCHEMAS
# =============================================


class ChallengeCategoryBase(BaseModel):
    """Base challenge category schema."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Category name",
        examples=["Web", "Crypto", "Reverse Engineering"],
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Category description",
        examples=["Web application security challenges"],
    )


class ChallengeCategoryCreate(ChallengeCategoryBase):
    """Schema for creating a challenge category."""

    is_active: bool = Field(
        default=True, description="Whether the category is active", examples=[True]
    )


class ChallengeCategoryResponse(ChallengeCategoryBase):
    """Schema for challenge category response."""

    id: int
    is_active: bool
    created_at: datetime
    challenge_count: Optional[int] = Field(
        default=0, description="Number of challenges in this category"
    )

    model_config = ConfigDict(from_attributes=True)


# =============================================
# CHALLENGE SCHEMAS
# =============================================


class ChallengeBase(BaseModel):
    """Base challenge schema with common fields."""

    title: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Challenge title",
        examples=["SQL Injection 101", "Hidden Message"],
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Challenge description with hints and instructions",
        examples=["Find the flag in this web application..."],
    )


class ChallengeCreate(ChallengeBase):
    """Schema for creating a challenge (admin only)."""

    category_id: int = Field(..., gt=0, description="Category ID", examples=[1])
    difficulty_id: int = Field(
        ..., gt=0, description="Difficulty level ID", examples=[2]
    )
    flag: str = Field(
        ...,
        min_length=5,
        max_length=255,
        description="The correct flag (stored in plain text)",
        examples=["RabbitCTF{h1dd3n_fl4g}"],
    )
    base_score: int = Field(
        ...,
        ge=10,
        le=1000,
        description="Base score for the challenge (10-1000)",
        examples=[250],
    )
    scoring_mode: str = Field(
        default="STATIC",
        pattern=r"^(STATIC|DYNAMIC)$",
        description="Scoring mode: STATIC or DYNAMIC",
        examples=["DYNAMIC"],
    )
    decay_factor: Optional[float] = Field(
        None,
        ge=0.1,
        le=1.0,
        description="Decay factor for dynamic scoring (0.1-1.0)",
        examples=[0.9],
    )
    min_score: Optional[int] = Field(
        None, ge=10, description="Minimum score for dynamic scoring", examples=[100]
    )
    attempt_limit: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Maximum number of submission attempts",
        examples=[5],
    )
    is_case_sensitive: bool = Field(
        default=True,
        description="Whether flag validation is case-sensitive",
        examples=[True],
    )
    is_draft: bool = Field(
        default=True,
        description="Whether the challenge is in draft mode",
        examples=[False],
    )
    is_visible: bool = Field(
        default=False,
        description="Whether the challenge is visible to participants",
        examples=[True],
    )
    visible_from: Optional[datetime] = Field(
        None,
        description="When the challenge becomes visible",
        examples=["2025-12-01T00:00:00Z"],
    )
    visible_until: Optional[datetime] = Field(
        None,
        description="When the challenge stops being visible",
        examples=["2025-12-31T23:59:59Z"],
    )
    operational_data: Optional[str] = Field(
        None,
        max_length=1000,
        description="Additional operational data (URLs, IPs, etc.)",
        examples=["http://challenge.local:8080"],
    )

    @field_validator("flag")
    @classmethod
    def validate_flag_format(cls, v: str) -> str:
        """Validate flag format."""
        if not v.startswith("RabbitCTF{") or not v.endswith("}"):
            raise ValueError("Flag must be in format: RabbitCTF{...}")
        if len(v) < 15:  # RabbitCTF{} = 12 chars + at least 3 inside
            raise ValueError("Flag content too short")
        return v

    @field_validator("scoring_mode")
    @classmethod
    def validate_scoring_mode(cls, v: str) -> str:
        """Validate scoring mode."""
        if v not in ["STATIC", "DYNAMIC"]:
            raise ValueError("Scoring mode must be STATIC or DYNAMIC")
        return v


class ChallengeUpdate(BaseModel):
    """Schema for updating a challenge."""

    title: Optional[str] = Field(
        None, min_length=3, max_length=100, examples=["Updated Challenge Title"]
    )
    description: Optional[str] = Field(
        None, min_length=10, max_length=5000, examples=["Updated description..."]
    )
    category_id: Optional[int] = Field(None, gt=0)
    difficulty_id: Optional[int] = Field(None, gt=0)
    flag: Optional[str] = Field(
        None,
        min_length=5,
        max_length=255,
        description="The correct flag (stored in plain text)",
        examples=["RabbitCTF{upd4t3d_fl4g}"],
    )
    base_score: Optional[int] = Field(
        None, 
        ge=10, 
        le=1000,
        description="Base score (cannot be changed if challenge has submissions)"
    )
    scoring_mode: Optional[str] = Field(
        None,
        pattern=r"^(STATIC|DYNAMIC)$",
        description="Scoring mode (cannot be changed if challenge has submissions)",
    )
    decay_factor: Optional[float] = Field(
        None,
        ge=0.1,
        le=1.0,
        description="Decay factor for dynamic scoring (cannot be changed if challenge has submissions)",
    )
    min_score: Optional[int] = Field(
        None, 
        ge=10, 
        description="Minimum score (cannot be changed if challenge has submissions)"
    )
    is_draft: Optional[bool] = None
    is_visible: Optional[bool] = None
    visible_from: Optional[datetime] = None
    visible_until: Optional[datetime] = None
    operational_data: Optional[str] = Field(None, max_length=1000)
    is_case_sensitive: Optional[bool] = Field(
        None,
        description="Whether flag validation is case-sensitive",
    )

    @field_validator("flag")
    @classmethod
    def validate_flag_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate flag format."""
        if v is None:
            return v
        if not v.startswith("RabbitCTF{") or not v.endswith("}"):
            raise ValueError("Flag must be in format: RabbitCTF{...}")
        if len(v) < 15:
            raise ValueError("Flag content too short")
        return v

    @field_validator("scoring_mode")
    @classmethod
    def validate_scoring_mode(cls, v: Optional[str]) -> Optional[str]:
        """Validate scoring mode."""
        if v is None:
            return v
        if v not in ["STATIC", "DYNAMIC"]:
            raise ValueError("Scoring mode must be STATIC or DYNAMIC")
        return v


class ChallengeResponse(ChallengeBase):
    """Schema for challenge response (participant view)."""

    id: int
    category_id: Optional[int]
    category_name: Optional[str] = None
    difficulty_id: int
    difficulty_name: Optional[str] = None
    base_score: int
    current_score: Optional[int] = Field(
        None, description="Current score (may differ from base for dynamic scoring)"
    )
    solve_count: Optional[int] = Field(
        default=0, description="Number of teams that solved this challenge"
    )
    is_solved: bool = Field(
        default=False,
        description="Whether current user's team has solved this challenge",
    )
    solved_by: Optional[str] = Field(
        None,
        description="Username of the team member who solved the challenge",
    )
    blocked_until: Optional[datetime] = Field(
        None,
        description="If user is blocked from submitting, this is the expiration time"
    )
    created_at: datetime
    operational_data: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ScoreConfigNested(BaseModel):
    """Nested score configuration."""
    base_score: int
    scoring_mode: str
    decay_factor: Optional[float]
    min_score: Optional[int]


class VisibilityConfigNested(BaseModel):
    """Nested visibility configuration."""
    is_visible: bool
    visible_from: Optional[datetime]
    visible_until: Optional[datetime]


class RuleConfigNested(BaseModel):
    """Nested rule configuration."""
    attempt_limit: int
    is_case_sensitive: bool


class ChallengeDetailResponse(ChallengeResponse):
    """Schema for detailed challenge response (admin view)."""

    is_draft: bool
    score_config: ScoreConfigNested
    visibility_config: VisibilityConfigNested
    rule_config: RuleConfigNested
    created_by: Optional[int]
    updated_at: Optional[datetime]
    total_attempts: Optional[int] = Field(
        default=0, description="Total number of submission attempts"
    )
    success_rate: Optional[float] = Field(
        default=0.0, description="Percentage of successful submissions"
    )
    flag_content: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChallengeFileUpload(BaseModel):
    """Schema for challenge file upload metadata."""

    challenge_id: int = Field(..., gt=0)
    file_name: str = Field(..., min_length=1, max_length=255)
    file_type: Optional[str] = Field(None, max_length=20)
    file_size_mb: Optional[float] = Field(None, ge=0)


class ChallengeFileResponse(BaseModel):
    """Schema for challenge file response."""

    id: int
    challenge_id: int
    file_name: str
    file_path: str
    file_type: Optional[str]
    file_size_mb: Optional[float]
    uploaded_at: datetime
    download_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# =============================================
# FLAG SUBMISSION SCHEMAS
# =============================================


class FlagSubmit(BaseModel):
    """Schema for submitting a flag."""

    challenge_id: int = Field(..., gt=0, description="Challenge ID", examples=[5])
    flag: str = Field(
        ...,
        min_length=5,
        max_length=255,
        description="Flag attempt",
        examples=["RabbitCTF{my_fl4g_4tt3mpt}"],
    )

    @field_validator("flag")
    @classmethod
    def validate_flag_not_empty(cls, v: str) -> str:
        """Validate flag is not empty or whitespace."""
        if not v.strip():
            raise ValueError("Flag cannot be empty")
        return v.strip()


class FlagSubmitResponse(BaseModel):
    """Schema for flag submission response."""

    success: bool = Field(
        ..., description="Whether the flag was correct", examples=[True]
    )
    message: str = Field(
        ...,
        description="Response message",
        examples=["Correct flag! You earned 250 points."],
    )
    awarded_score: Optional[int] = Field(
        None, description="Points awarded for correct flag", examples=[250]
    )
    attempts_remaining: Optional[int] = Field(
        None, description="Number of attempts remaining", examples=[3]
    )
    blocked_until: Optional[datetime] = Field(
        None,
        description="Timestamp until which submissions are blocked",
        examples=["2025-12-01T12:30:00Z"],
    )


# =============================================
# CHALLENGE LISTING & FILTERING
# =============================================


class ChallengeListFilters(BaseModel):
    """Schema for filtering challenges."""

    category_id: Optional[int] = Field(None, gt=0)
    difficulty_id: Optional[int] = Field(None, gt=0)
    is_solved: Optional[bool] = None
    search: Optional[str] = Field(None, max_length=100)
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=50, ge=1, le=100)


class ChallengeListResponse(BaseModel):
    """Schema for paginated challenge list."""

    total: int
    challenges: List[ChallengeResponse]
    categories: List[ChallengeCategoryResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# =============================================
# CHALLENGE CREATION REQUEST (NEW API FORMAT)
# =============================================


class ScoreConfigCreate(BaseModel):
    """Schema for score configuration."""
    base_score: int = Field(..., ge=10, le=1000)
    scoring_mode: str = Field(default="static", pattern=r"^(static|dynamic)$")
    decay_factor: Optional[float] = Field(None, ge=0.1, le=1.0)
    min_score: Optional[int] = Field(None, ge=10)


class RuleConfigCreate(BaseModel):
    """Schema for rule configuration."""
    attempt_limit: int = Field(default=5, ge=1, le=100)
    is_case_sensitive: bool = Field(default=True)


class VisibilityConfigCreate(BaseModel):
    """Schema for visibility configuration."""
    is_visible: bool = Field(default=False)


class ScoreConfigUpdate(BaseModel):
    """Schema for updating score configuration."""
    base_score: Optional[int] = Field(None, ge=10, le=1000)
    scoring_mode: Optional[str] = Field(None, pattern=r"^(static|dynamic)$")
    decay_factor: Optional[float] = Field(None, ge=0.1, le=1.0)
    min_score: Optional[int] = Field(None, ge=10)


class RuleConfigUpdate(BaseModel):
    """Schema for updating rule configuration."""
    attempt_limit: Optional[int] = Field(None, ge=1, le=100)
    is_case_sensitive: Optional[bool] = None


class VisibilityConfigUpdate(BaseModel):
    """Schema for updating visibility configuration."""
    is_visible: Optional[bool] = None


class ChallengeCreateRequest(BaseModel):
    """Schema for creating a challenge with nested configurations."""
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=5000)
    category_id: int = Field(..., gt=0)
    difficulty_id: int = Field(..., gt=0)
    is_draft: bool = Field(default=True)
    connection_info: Optional[str] = Field(None, max_length=1000)
    flag_value: str = Field(..., min_length=5, max_length=255)
    score_config: ScoreConfigCreate
    rule_config: RuleConfigCreate
    visibility_config: VisibilityConfigCreate

    @field_validator("flag_value")
    @classmethod
    def validate_flag_not_empty(cls, v: str) -> str:
        """Validate flag is not empty."""
        if not v.strip():
            raise ValueError("Flag cannot be empty")
        return v.strip()


class ChallengeUpdateRequest(BaseModel):
    """Schema for updating a challenge with nested configurations (admin only)."""

    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    category_id: Optional[int] = Field(None, gt=0)
    difficulty_id: Optional[int] = Field(None, gt=0)
    is_draft: Optional[bool] = None
    connection_info: Optional[str] = Field(None, max_length=1000)
    flag_value: Optional[str] = Field(None, min_length=5, max_length=255)
    score_config: Optional[ScoreConfigUpdate] = None
    rule_config: Optional[RuleConfigUpdate] = None
    visibility_config: Optional[VisibilityConfigUpdate] = None

    @field_validator("flag_value")
    @classmethod
    def validate_flag_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate flag is not empty when provided."""
        if v is not None and not v.strip():
            raise ValueError("Flag cannot be empty")
        return v.strip() if v is not None else v

