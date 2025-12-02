from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.api import deps
from app.schemas.challenges import ChallengeResponse, ChallengeCategoryResponse
from app.models.challenge import Challenge
from app.models.challenge_category import ChallengeCategory

router = APIRouter()

@router.get("/categories", response_model=List[ChallengeCategoryResponse])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve challenge categories.
    """
    categories = db.query(ChallengeCategory).filter(ChallengeCategory.is_active == True).offset(skip).limit(limit).all()
    return categories

@router.get("/", response_model=List[ChallengeResponse])
def read_challenges(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve challenges.
    """
    challenges = db.query(Challenge).options(
        joinedload(Challenge.category),
        joinedload(Challenge.difficulty),
        joinedload(Challenge.score_config)
    ).filter(Challenge.is_draft == False).offset(skip).limit(limit).all()

    results = []
    for c in challenges:
        results.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category_id": c.category_id,
            "category_name": c.category.name if c.category else None,
            "difficulty_id": c.difficulty_id,
            "difficulty_name": c.difficulty.name if c.difficulty else None,
            "base_score": c.score_config.base_score if c.score_config else 0,
            "current_score": c.score_config.base_score if c.score_config else 0, # Placeholder for dynamic scoring
            "solve_count": 0, # Placeholder
            "is_solved": False, # Placeholder
            "created_at": c.created_at,
            "operational_data": c.operational_data,
        })
        
    return results
