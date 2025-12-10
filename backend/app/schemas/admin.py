from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime


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


class AdminSubmissionResponse(BaseModel):
    id: int
    user_id: int
    username: str
    team_id: int
    team_name: str
    challenge_id: int
    challenge_title: str
    category_name: str
    submitted_flag: str
    is_correct: bool
    submitted_at: datetime

    class Config:
        from_attributes = True

