from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.api import deps
from app.schemas.challenges import ChallengeResponse, ChallengeCategoryResponse, ChallengeDetailResponse
from app.models.challenge import Challenge
from app.models.challenge_category import ChallengeCategory

router = APIRouter()


@router.get("/categories", response_model=List[ChallengeCategoryResponse])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve challenge categories.
    """
    categories = (
        db.query(ChallengeCategory)
        .filter(ChallengeCategory.is_active)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return categories


@router.get("/", response_model=List[ChallengeResponse])
def read_challenges(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve challenges.
    """
    challenges = (
        db.query(Challenge)
        .options(
            joinedload(Challenge.category),
            joinedload(Challenge.difficulty),
            joinedload(Challenge.score_config),
        )
        .filter(~Challenge.is_draft)
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for c in challenges:
        results.append(
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "category_id": c.category_id,
                "category_name": c.category.name if c.category else None,
                "difficulty_id": c.difficulty_id,
                "difficulty_name": c.difficulty.name if c.difficulty else None,
                "base_score": c.score_config.base_score if c.score_config else 0,
                "current_score": c.score_config.base_score
                if c.score_config
                else 0,  # Placeholder for dynamic scoring
                "solve_count": 0,  # Placeholder
                "is_solved": False,  # Placeholder
                "created_at": c.created_at,
                "operational_data": c.operational_data,
            }
        )

    return results


@router.get("/admin/all", response_model=List[ChallengeDetailResponse])
def read_all_challenges_admin(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Retrieve all challenges (admin only).
    """
    challenges = (
        db.query(Challenge)
        .options(
            joinedload(Challenge.category),
            joinedload(Challenge.difficulty),
            joinedload(Challenge.score_config),
            joinedload(Challenge.rule_config),
            joinedload(Challenge.visibility_config),
            joinedload(Challenge.flag),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    
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
            "current_score": c.score_config.base_score if c.score_config else 0,
            "solve_count": 0,
            "is_solved": False,
            "created_at": c.created_at,
            "operational_data": c.operational_data,
            
            "is_draft": c.is_draft,
            "is_visible": c.visibility_config.is_visible if c.visibility_config else False,
            "visible_from": c.visibility_config.visible_from if c.visibility_config else None,
            "visible_until": c.visibility_config.visible_until if c.visibility_config else None,
            "attempt_limit": c.rule_config.attempt_limit if c.rule_config else 0,
            "is_case_sensitive": c.rule_config.is_case_sensitive if c.rule_config else True,
            "scoring_mode": c.score_config.scoring_mode if c.score_config else "STATIC",
            "decay_factor": c.score_config.decay_factor if c.score_config else None,
            "min_score": c.score_config.min_score if c.score_config else None,
            "created_by": c.created_by,
            "updated_at": c.updated_at,
            "total_attempts": 0,
            "success_rate": 0.0,
            "flag_content": c.flag.flag_value if c.flag else None
        })

    return results
