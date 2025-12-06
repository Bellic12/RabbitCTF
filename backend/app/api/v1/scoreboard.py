from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
import random
from datetime import datetime, timedelta

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
async def get_scoreboard():
    teams_data = [
        "CyberNinjas", "HackMasters", "ByteBusters", "SecurityPros", 
        "CodeBreakers", "ZeroDayHunters", "CryptoWarriors", 
        "BinaryBandits", "PixelPwners", "ShellShockers"
    ]
    
    response_teams = []
    
    start_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
    
    for i, team_name in enumerate(teams_data):
        timeline = []
        current_score = 0
        current_time = start_time
        
        timeline.append(ScorePoint(time=current_time.strftime("%H:%M"), score=0))
        
        num_points = 15
        solves_count = 0
        last_solve_time = start_time
        
        for j in range(num_points):
            minutes_delta = 30
            current_time += timedelta(minutes=minutes_delta)
            
            if random.random() > 0.3:
                points = random.randint(50, 500)
                points += (10 - i) * 20 
                current_score += points
                solves_count += 1
                last_solve_time = current_time
            
            timeline.append(ScorePoint(time=current_time.strftime("%H:%M"), score=current_score))
            
        response_teams.append(TeamScoreboard(
            id=i + 1,
            name=team_name,
            timeline=timeline,
            totalScore=current_score,
            solves=solves_count,
            lastSolve=last_solve_time.strftime("%Y-%m-%d %H:%M:%S")
        ))
    
    response_teams.sort(key=lambda x: x.totalScore, reverse=True)
    
    return ScoreboardResponse(teams=response_teams)
