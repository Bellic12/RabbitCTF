from pydantic import BaseModel
from typing import List, Optional


class AdminStatsResponse(BaseModel):
    total_users: int
    total_teams: int
    total_challenges: int
    active_challenges: int
    total_submissions: int
    correct_flags: int


class ChallengeStatItem(BaseModel):
    id: int
    title: str
    category: str
    difficulty: str
    success_rate: float
    attempts: int
    solves: int


class ChallengeStatsResponse(BaseModel):
    general_success_rate: float
    total_attempts: int
    successful_attempts: int
    average_attempts: float
    challenges_stats: List[ChallengeStatItem]


class EventConfigUpdate(BaseModel):
    max_team_size: Optional[int] = None
    max_submission_attempts: Optional[int] = None
    submission_time_window_seconds: Optional[int] = None
    submission_block_minutes: Optional[int] = None


class EventConfigResponse(BaseModel):
    max_team_size: int
    max_submission_attempts: int
    submission_time_window_seconds: int
    submission_block_minutes: int

    class Config:
        from_attributes = True


