from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int
    total_teams: int
    total_challenges: int
    active_challenges: int
    total_submissions: int
    correct_flags: int
