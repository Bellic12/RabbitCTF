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


class EventConfigBase(BaseModel):
    max_submission_attempts: int
    submission_time_window_seconds: int
    submission_block_minutes: int


class EventConfigUpdate(EventConfigBase):
    pass


class EventConfigResponse(EventConfigBase):
    id: int
    
    class Config:
        from_attributes = True

