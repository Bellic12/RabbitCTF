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
def get_scoreboard(db: Session = Depends(get_db)) -> ScoreboardResponse:
    """
    Return scoreboard data using pre-calculated scores from database.
    
    Scoring Logic:
    - Scores are calculated when flags are submitted using Strategy Pattern
    - awarded_score in submission table stores the calculated score
    - total_score in team table stores the accumulated team score
    - Scores are NOT recalculated to ensure consistency and performance
    
    Note: Challenge scoring configuration (mode, base_score, decay_factor) 
    cannot be modified after creation to maintain score integrity.
    """
    
    # 1. Get all teams
    teams = db.query(Team).all()

    if not teams:
        return ScoreboardResponse(teams=[])

    # 2. Get all successful submissions ordered by time with their awarded scores
    all_correct_submissions = (
        db.query(Submission)
        .filter(Submission.is_correct.is_(True))
        .order_by(Submission.submitted_at.asc(), Submission.id.asc())
        .all()
    )
    
    # 3. Build progression data using pre-calculated awarded_score
    progression_map = defaultdict(list)
    team_solve_counts = defaultdict(int)
    team_last_solve = {}
    
    for submission in all_correct_submissions:
        team_id = submission.team_id
        
        # Use the pre-calculated awarded_score from database
        awarded_points = submission.awarded_score or 0
        
        # Update team stats
        team_solve_counts[team_id] += 1
        team_last_solve[team_id] = submission.submitted_at
        
        # Add to progression
        cumulative_list = progression_map[team_id]
        previous_score = cumulative_list[-1]["score"] if cumulative_list else 0
        cumulative_score = previous_score + awarded_points
        
        # Handle identical timestamps for visualization
        current_time = submission.submitted_at
        if current_time is None:
            continue
            
        if cumulative_list:
            last_time = cumulative_list[-1]["time"]
            if current_time <= last_time:
                # Add 1 minute offset to make it visible on chart
                current_time = last_time + timedelta(minutes=1)

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

    # 5. Build response
    response_teams = []

    for team in teams:
        solves = team_solve_counts.get(team.id, 0)
        last_solve_dt = team_last_solve.get(team.id)
        
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

        # Use team.total_score from DB as the authoritative value
        # (It's pre-calculated and updated on each correct submission)
        final_score = team.total_score or 0

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
    response_teams.sort(key=lambda x: (-x.totalScore, x.lastSolve))

    return ScoreboardResponse(teams=response_teams)
