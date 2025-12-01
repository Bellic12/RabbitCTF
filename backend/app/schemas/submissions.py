"""
Submission schemas for RabbitCTF.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# =============================================
# SUBMISSION SCHEMAS
# =============================================

class SubmissionBase(BaseModel):
    """Base submission schema."""
    challenge_id: int = Field(..., gt=0)
    submitted_flag_hash: str = Field(..., max_length=255)


class SubmissionResponse(BaseModel):
    """Schema for submission response."""
    id: int
    user_id: int
    username: Optional[str] = None
    team_id: int
    team_name: Optional[str] = None
    challenge_id: int
    challenge_title: Optional[str] = None
    is_correct: bool
    awarded_score: Optional[int] = None
    submitted_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SubmissionDetailResponse(SubmissionResponse):
    """Schema for detailed submission response (admin view)."""
    submitted_flag_hash: str
    ip_address: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class SubmissionHistoryResponse(BaseModel):
    """Schema for submission history."""
    total_submissions: int
    correct_submissions: int
    incorrect_submissions: int
    success_rate: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of successful submissions"
    )
    submissions: List[SubmissionResponse]
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# SUBMISSION BLOCK SCHEMAS
# =============================================

class SubmissionBlockResponse(BaseModel):
    """Schema for submission block information."""
    id: int
    user_id: int
    challenge_id: Optional[int] = None
    blocked_until: datetime
    reason: Optional[str] = None
    created_at: datetime
    is_active: bool = Field(
        ...,
        description="Whether the block is currently active"
    )
    
    model_config = ConfigDict(from_attributes=True)


class UserSubmissionStatus(BaseModel):
    """Schema for user's submission status for a challenge."""
    challenge_id: int
    attempts_made: int
    attempts_remaining: int
    is_blocked: bool
    blocked_until: Optional[datetime] = None
    has_solved: bool
    last_attempt_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# STATISTICS SCHEMAS
# =============================================

class SubmissionStatsResponse(BaseModel):
    """Schema for submission statistics."""
    total_submissions: int
    unique_solvers: int
    average_attempts: float = Field(
        ...,
        description="Average number of attempts before solving"
    )
    fastest_solve_time: Optional[int] = Field(
        None,
        description="Fastest solve time in minutes"
    )
    recent_activity: List[SubmissionResponse] = Field(
        default_factory=list,
        description="Recent submissions"
    )
    
    model_config = ConfigDict(from_attributes=True)


class TeamSubmissionStats(BaseModel):
    """Schema for team submission statistics."""
    team_id: int
    team_name: str
    total_attempts: int
    successful_solves: int
    failed_attempts: int
    success_rate: float
    total_score: int
    last_solve_time: Optional[datetime] = None
    challenges_by_category: dict = Field(
        default_factory=dict,
        description="Solved challenges grouped by category"
    )
    
    model_config = ConfigDict(from_attributes=True)


# =============================================
# FIRST BLOOD SCHEMAS
# =============================================

class FirstBloodResponse(BaseModel):
    """Schema for first blood (first solve) information."""
    challenge_id: int
    challenge_title: str
    team_id: int
    team_name: str
    user_id: int
    username: str
    solved_at: datetime
    time_to_solve: Optional[int] = Field(
        None,
        description="Time to solve from challenge release (in minutes)"
    )
    
    model_config = ConfigDict(from_attributes=True)


class SolveTimelineEntry(BaseModel):
    """Schema for solve timeline entry."""
    team_id: int
    team_name: str
    challenge_id: int
    challenge_title: str
    category_name: str
    difficulty_name: str
    score_awarded: int
    solved_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SolveTimelineResponse(BaseModel):
    """Schema for solve timeline (all solves chronologically)."""
    total_solves: int
    timeline: List[SolveTimelineEntry]
    
    model_config = ConfigDict(from_attributes=True)
