from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from app.core.database import get_db
from app.api import deps
from app.models.team import Team
from app.models.submission import Submission
from app.models.challenge_score_config import ChallengeScoreConfig
from app.models.event_config import EventConfig

router = APIRouter()

class ScorePoint(BaseModel):
    time: str
    score: int

class TeamScoreboard(BaseModel):
    id: int
    name: str
    timeline: List[ScorePoint]
    totalScore: int
    solves: int
    lastSolve: str  # ISO format or relative time string

class ScoreboardResponse(BaseModel):
    teams: List[TeamScoreboard]

@router.get("/", response_model=ScoreboardResponse)
def get_scoreboard(
    db: Session = Depends(get_db),
) -> ScoreboardResponse:
    """Return scoreboard data sourced from real submissions."""
    
    # 1. Get all teams
    teams = db.query(Team).all()

    if not teams:
        return ScoreboardResponse(teams=[])

    # 2. Get solve stats (count and last solve time)
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

    stats_map = {
        row.team_id: {"solves": int(row.solves or 0), "last_solve": row.last_solve}
        for row in correct_submission_stats
    }

    # 3. Get progression data
    progression_rows = (
        db.query(
            Submission.team_id,
            Submission.submitted_at,
            func.coalesce(Submission.awarded_score, ChallengeScoreConfig.base_score, 0).label("points"),
        )
        .outerjoin(
            ChallengeScoreConfig,
            ChallengeScoreConfig.challenge_id == Submission.challenge_id,
        )
        .filter(Submission.is_correct.is_(True))
        .order_by(Submission.team_id.asc(), Submission.submitted_at.asc(), Submission.id.asc())
        .all()
    )

    progression_map = defaultdict(list)
    for row in progression_rows:
        if row.submitted_at is None:
            continue
        cumulative_list = progression_map[row.team_id]
        previous_score = cumulative_list[-1]["score"] if cumulative_list else 0
        cumulative_score = previous_score + int(row.points or 0)
        
        # Handle identical timestamps for visualization
        # If multiple submissions happen at the same second (e.g. seed data),
        # we add a small offset based on order to show progression.
        current_time = row.submitted_at
        if cumulative_list:
            last_time = cumulative_list[-1]["time"]
            if current_time <= last_time:
                # Add 1 minute offset to make it visible on chart
                current_time = last_time + timedelta(minutes=1)

        # Store as dict first, convert to ScorePoint later
        cumulative_list.append(
            {"time": current_time, "score": cumulative_score}
        )

    # 4. Get event start time for the initial point (0, 0)
    event_start = (
        db.query(EventConfig.start_time)
        .filter(EventConfig.start_time.isnot(None))
        .order_by(EventConfig.start_time.asc())
        .scalar()
    )
    
    # Fallback if no event start
    default_start = datetime.now(timezone.utc)

    response_teams = []

    for team in teams:
        team_stats = stats_map.get(team.id, {"solves": 0, "last_solve": None})
        solves = team_stats["solves"]
        last_solve_dt = team_stats["last_solve"]
        
        # Format last_solve
        last_solve_str = last_solve_dt.strftime("%Y-%m-%d %H:%M:%S") if last_solve_dt else "N/A"

        progression_points = progression_map.get(team.id, []).copy()

        # Add initial point (0 score)
        reference_time = event_start or team.created_at or default_start
        
        # Ensure we have a start point
        if not progression_points:
             progression_points.append({"time": reference_time, "score": 0})
        else:
            first_point_time = progression_points[0]["time"]
            if first_point_time > reference_time:
                progression_points.insert(0, {"time": reference_time, "score": 0})
            elif first_point_time == reference_time and progression_points[0]["score"] != 0:
                progression_points.insert(0, {"time": reference_time, "score": 0})

        # Calculate final score from progression instead of relying on team.total_score
        final_score = 0
        if progression_points:
            final_score = progression_points[-1]["score"]

        # Convert to ScorePoint models with string time
        timeline_models = [
            ScorePoint(
                time=p["time"].strftime("%Y-%m-%d %H:%M:%S") if isinstance(p["time"], datetime) else str(p["time"]),
                score=p["score"]
            )
            for p in progression_points
        ]

        response_teams.append(
            TeamScoreboard(
                id=team.id,
                name=team.name,
                timeline=timeline_models,
                totalScore=final_score,
                solves=solves,
                lastSolve=last_solve_str,
            )
        )

    # Sort teams by score desc, then last solve time asc (earlier is better)
    # Note: "N/A" lastSolve will be > any date string, so teams with 0 solves go to bottom if scores are equal (0)
    response_teams.sort(key=lambda x: (-x.totalScore, x.lastSolve))

    return ScoreboardResponse(teams=response_teams)
