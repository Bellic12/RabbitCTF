"""Leaderboard endpoints."""
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.event_config import EventConfig
from app.models.submission import Submission
from app.models.team import Team


router = APIRouter()


class ScoreProgressPoint(BaseModel):
    """Represents an accumulated score at a moment in time."""

    time: datetime
    score: int


class TeamLeaderboard(BaseModel):
    """Leaderboard projection for a single team."""

    team_id: int = Field(serialization_alias="id")
    team_name: str = Field(serialization_alias="name")
    score: int = Field(serialization_alias="totalScore")
    solves: int
    last_solve: Optional[datetime] = Field(serialization_alias="lastSolve")
    progression: List[ScoreProgressPoint] = Field(serialization_alias="timeline")


class LeaderboardResponse(BaseModel):
    """Leaderboard payload."""

    teams: List[TeamLeaderboard]


@router.get("/", response_model=LeaderboardResponse)
def get_leaderboard(db: Session = Depends(get_db)) -> LeaderboardResponse:
    """Return leaderboard data sourced from real submissions."""

    teams = (
        db.query(Team)
        .order_by(func.coalesce(Team.total_score, 0).desc(), Team.name.asc())
        .all()
    )

    if not teams:
        return LeaderboardResponse(teams=[])

    correct_submission_stats = (
        db.query(
            Submission.team_id,
            func.count(Submission.id).label("solves"),
            func.max(Submission.submitted_at).label("last_solve"),
        )
        .filter(Submission.is_correct.is_(True))
        .group_by(Submission.team_id)
        .all()
    )

    @dataclass
    class SubmissionStats:
        solves: int
        last_solve: Optional[datetime]

    stats_map: Dict[int, SubmissionStats] = {
        row.team_id: SubmissionStats(solves=int(row.solves or 0), last_solve=row.last_solve)
        for row in correct_submission_stats
    }

    progression_rows = (
        db.query(
            Submission.team_id,
            Submission.submitted_at,
            Submission.awarded_score.label("points"),
        )
        .filter(Submission.is_correct.is_(True))
        .order_by(Submission.team_id.asc(), Submission.submitted_at.asc(), Submission.id.asc())
        .all()
    )

    progression_map: Dict[int, List[ScoreProgressPoint]] = defaultdict(list)
    for row in progression_rows:
        if row.submitted_at is None:
            continue
        cumulative_list = progression_map[row.team_id]
        previous_score = cumulative_list[-1].score if cumulative_list else 0
        cumulative_score = previous_score + int(row.points or 0)
        
        # Fix timestamp collision for visualization
        current_time = row.submitted_at
        if cumulative_list:
            last_time = cumulative_list[-1].time
            if current_time <= last_time:
                current_time = last_time + timedelta(minutes=1)

        cumulative_list.append(
            ScoreProgressPoint(time=current_time, score=cumulative_score)
        )

    event_start = (
        db.query(EventConfig.start_time)
        .filter(EventConfig.start_time.isnot(None))
        .order_by(EventConfig.start_time.asc())
        .scalar()
    )

    leaderboard_teams: List[TeamLeaderboard] = []

    for team in teams:
        team_stats = stats_map.get(team.id)
        solves = team_stats.solves if team_stats else 0
        last_solve = team_stats.last_solve if team_stats else None

        progression_points = progression_map.get(team.id, []).copy()

        if not progression_points:
            reference_time = event_start or team.created_at or datetime.now(timezone.utc)
            progression_points.append(ScoreProgressPoint(time=reference_time, score=0))
        else:
            reference_time = event_start or team.created_at
            if reference_time:
                first_point_time = progression_points[0].time
                if first_point_time > reference_time:
                    progression_points.insert(0, ScoreProgressPoint(time=reference_time, score=0))
                elif first_point_time == reference_time and progression_points[0].score != 0:
                    progression_points.insert(0, ScoreProgressPoint(time=reference_time, score=0))

        # Use team.total_score as the authoritative value
        # (It's pre-calculated and updated on each correct submission)
        final_score = team.total_score or 0

        leaderboard_teams.append(
            TeamLeaderboard(
                team_id=team.id,
                team_name=team.name,
                score=final_score,
                solves=solves,
                last_solve=last_solve,
                progression=progression_points,
            )
        )
    
    # Sort teams by score desc, then last solve time asc (earlier is better)
    leaderboard_teams.sort(key=lambda x: (-x.score, x.last_solve or datetime.max.replace(tzinfo=timezone.utc)))

    return LeaderboardResponse(teams=leaderboard_teams)
