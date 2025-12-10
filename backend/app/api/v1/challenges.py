from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.api import deps
from app.core.database import get_db
from app.core.audit import log_audit
from app.schemas.challenges import (
    ChallengeResponse,
    ChallengeCategoryResponse,
    ChallengeDetailResponse,
    ChallengeCreateRequest,
    ChallengeUpdateRequest,
)
from app.models.challenge import Challenge
from app.models.challenge_category import ChallengeCategory
from app.models.difficulty import Difficulty
from app.models.challenge_score_config import ChallengeScoreConfig
from app.models.challenge_rule_config import ChallengeRuleConfig
from app.models.challenge_visibility_config import ChallengeVisibilityConfig
from app.models.challenge_flag import ChallengeFlag
from app.models.challenge_file import ChallengeFile
from app.models.submission import Submission
from app.models.submission_block import SubmissionBlock
from app.models.team_member import TeamMember
from app.models.team import Team
from datetime import datetime
import os
import uuid

router = APIRouter()


@router.get("/count", response_model=int)
def count_challenges(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get total number of active challenges (public).
    """
    return db.query(Challenge).filter(~Challenge.is_draft).count()


@router.get("/categories", response_model=List[ChallengeCategoryResponse])
def read_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    include_hidden: bool = False,
    current_user=Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve challenge categories.
    """
    query = (
        db.query(
            ChallengeCategory,
            func.count(Challenge.id).label("challenge_count")
        )
        .outerjoin(Challenge, Challenge.category_id == ChallengeCategory.id)
    )

    if not include_hidden:
        query = query.filter(ChallengeCategory.is_active)

    results = (
        query
        .group_by(ChallengeCategory.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        ChallengeCategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            is_active=cat.is_active,
            created_at=cat.created_at,
            challenge_count=count
        )
        for cat, count in results
    ]


@router.get("/difficulties", response_model=List[dict])
def read_difficulties(
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve challenge difficulties.
    """
    difficulties = db.query(Difficulty).order_by(Difficulty.sort_order).all()
    return [{"id": d.id, "name": d.name} for d in difficulties]


@router.get("/", response_model=List[ChallengeResponse])
def read_challenges(
    db: Session = Depends(get_db),
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
            joinedload(Challenge.visibility_config),
        )
        .filter(~Challenge.is_draft)
        .filter(Challenge.visibility_config.has(is_visible=True))
        .join(ChallengeCategory)
        .filter(ChallengeCategory.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Get solve counts
    solve_counts = (
        db.query(Submission.challenge_id, func.count(Submission.id))
        .filter(Submission.is_correct == True)
        .group_by(Submission.challenge_id)
        .all()
    )
    solve_counts_map = {sc[0]: sc[1] for sc in solve_counts}

    results = []
    for c in challenges:
        # Check if current user's team has solved this challenge
        team_member = (
            db.query(TeamMember)
            .filter(TeamMember.user_id == current_user.id)
            .first()
        )
        
        is_solved = False
        solved_by = None
        if team_member:
            submission = (
                db.query(Submission)
                .options(joinedload(Submission.user))
                .filter(
                    Submission.challenge_id == c.id,
                    Submission.team_id == team_member.team_id,
                    Submission.is_correct == True
                )
                .first()
            )
            if submission:
                is_solved = True
                solved_by = submission.user.username
        
        # Check if user is blocked
        blocked_until = None
        block = (
            db.query(SubmissionBlock)
            .filter(
                SubmissionBlock.user_id == current_user.id,
                SubmissionBlock.challenge_id == c.id,
                SubmissionBlock.blocked_until > datetime.utcnow(),
            )
            .first()
        )
        if block:
            blocked_until = block.blocked_until

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
                "current_score": c.score_config.base_score if c.score_config else 0,
                "solve_count": solve_counts_map.get(c.id, 0),
                "is_solved": is_solved,
                "solved_by": solved_by,
                "blocked_until": blocked_until,
                "created_at": c.created_at,
                "operational_data": c.operational_data,
            }
        )

    return results


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def read_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific challenge by ID.
    """
    challenge = (
        db.query(Challenge)
        .options(
            joinedload(Challenge.category),
            joinedload(Challenge.difficulty),
            joinedload(Challenge.score_config),
            joinedload(Challenge.visibility_config),
        )
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if challenge.is_draft or (challenge.visibility_config and not challenge.visibility_config.is_visible):
        if current_user.role.name != "admin":
            raise HTTPException(status_code=404, detail="Challenge not found")

    # Check if current user's team has solved this challenge
    team_member = (
        db.query(TeamMember)
        .filter(TeamMember.user_id == current_user.id)
        .first()
    )
    
    is_solved = False
    solved_by = None
    if team_member:
        submission = (
            db.query(Submission)
            .options(joinedload(Submission.user))
            .filter(
                Submission.challenge_id == challenge.id,
                Submission.team_id == team_member.team_id,
                Submission.is_correct == True
            )
            .first()
        )
        if submission:
            is_solved = True
            solved_by = submission.user.username

    # Check if user is blocked
    blocked_until = None
    block = (
        db.query(SubmissionBlock)
        .filter(
            SubmissionBlock.user_id == current_user.id,
            SubmissionBlock.challenge_id == challenge.id,
            SubmissionBlock.blocked_until > datetime.utcnow(),
        )
        .first()
    )
    if block:
        blocked_until = block.blocked_until

    # Get solve count
    solve_count = (
        db.query(Submission)
        .filter(Submission.challenge_id == challenge.id, Submission.is_correct == True)
        .count()
    )

    return {
        "id": challenge.id,
        "title": challenge.title,
        "description": challenge.description,
        "category_id": challenge.category_id,
        "category_name": challenge.category.name if challenge.category else None,
        "difficulty_id": challenge.difficulty_id,
        "difficulty_name": challenge.difficulty.name if challenge.difficulty else None,
        "base_score": challenge.score_config.base_score if challenge.score_config else 0,
        "current_score": challenge.score_config.base_score if challenge.score_config else 0,
        "solve_count": solve_count,
        "is_solved": is_solved,
        "solved_by": solved_by,
        "blocked_until": blocked_until,
        "created_at": challenge.created_at,
        "operational_data": challenge.operational_data,
    }


@router.get("/{challenge_id}/solves", response_model=List[dict])
def get_challenge_solves(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    Get list of teams that solved the challenge.
    """
    # Check if challenge exists and is visible
    challenge = (
        db.query(Challenge)
        .options(joinedload(Challenge.visibility_config))
        .filter(Challenge.id == challenge_id)
        .first()
    )
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    if not challenge.visibility_config.is_visible:
         # We need to check if user is admin. 
         # Assuming User model has role relationship and we can check role name
         if current_user.role.name != "admin":
             raise HTTPException(status_code=404, detail="Challenge not found")

    solves = (
        db.query(Submission)
        .join(Team)
        .filter(
            Submission.challenge_id == challenge_id,
            Submission.is_correct == True
        )
        .order_by(Submission.submitted_at.asc())
        .all()
    )
    
    return [
        {
            "team_id": s.team_id,
            "team_name": s.team.name,
            "submitted_at": s.submitted_at,
            "score": s.awarded_score
        }
        for s in solves
    ]


@router.get("/admin/all", response_model=List[ChallengeDetailResponse])
def read_all_challenges_admin(
    db: Session = Depends(get_db),
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
                "current_score": c.score_config.base_score if c.score_config else 0,
                "solve_count": 0,
                "is_solved": False,
                "created_at": c.created_at,
                "operational_data": c.operational_data,
                "is_draft": c.is_draft,
                "score_config": {
                    "base_score": c.score_config.base_score if c.score_config else 0,
                    "scoring_mode": c.score_config.scoring_mode if c.score_config else "STATIC",
                    "decay_factor": c.score_config.decay_factor if c.score_config else None,
                    "min_score": c.score_config.min_score if c.score_config else None,
                },
                "visibility_config": {
                    "is_visible": c.visibility_config.is_visible if c.visibility_config else False,
                    "visible_from": c.visibility_config.visible_from if c.visibility_config else None,
                    "visible_until": c.visibility_config.visible_until if c.visibility_config else None,
                },
                "rule_config": {
                    "attempt_limit": c.rule_config.attempt_limit if c.rule_config else 0,
                    "is_case_sensitive": c.rule_config.is_case_sensitive if c.rule_config else True,
                },
                "created_by": c.created_by,
                "updated_at": c.updated_at,
                "total_attempts": 0,
                "success_rate": 0.0,
                "flag_content": c.flag.flag_value if c.flag else None,
            }
        )

    return results


@router.post("/admin/create", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_challenge(
    challenge_data: ChallengeCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Create a new challenge (admin only).
    """
    # Validate category is active
    category = db.query(ChallengeCategory).filter(ChallengeCategory.id == challenge_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if not category.is_active:
        raise HTTPException(status_code=400, detail="Cannot assign challenge to an inactive category")

    # Create the challenge
    new_challenge = Challenge(
        title=challenge_data.title,
        description=challenge_data.description,
        category_id=challenge_data.category_id,
        difficulty_id=challenge_data.difficulty_id,
        created_by=current_user.id,
        is_draft=challenge_data.is_draft,
        operational_data=challenge_data.connection_info,
    )
    db.add(new_challenge)
    db.flush()  # Get the challenge ID

    # Create score config
    score_config = ChallengeScoreConfig(
        challenge_id=new_challenge.id,
        base_score=challenge_data.score_config.base_score,
        scoring_mode=challenge_data.score_config.scoring_mode.upper(),
        decay_factor=challenge_data.score_config.decay_factor,
        min_score=challenge_data.score_config.min_score,
    )
    db.add(score_config)

    # Create rule config
    rule_config = ChallengeRuleConfig(
        challenge_id=new_challenge.id,
        attempt_limit=challenge_data.rule_config.attempt_limit,
        is_case_sensitive=challenge_data.rule_config.is_case_sensitive,
    )
    db.add(rule_config)

    # Create visibility config
    visibility_config = ChallengeVisibilityConfig(
        challenge_id=new_challenge.id,
        is_visible=challenge_data.visibility_config.is_visible,
    )
    db.add(visibility_config)

    # Create flag (plain text)
    challenge_flag = ChallengeFlag(
        challenge_id=new_challenge.id, flag_value=challenge_data.flag_value
    )
    db.add(challenge_flag)

    db.commit()
    db.refresh(new_challenge)
    
    # Log challenge creation
    log_audit(
        db=db,
        user_id=current_user.id,
        action="CREATE",
        resource_type="challenge",
        resource_id=new_challenge.id,
        details={"action": "created_challenge", "challenge_title": new_challenge.title},
        request=request
    )

    return {"id": new_challenge.id, "title": new_challenge.title, "message": "Challenge created successfully"}


@router.patch("/admin/{challenge_id}/toggle-visibility", response_model=dict)
def toggle_challenge_visibility(
    challenge_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Toggle challenge visibility (admin only).
    """
    challenge = (
        db.query(Challenge)
        .options(joinedload(Challenge.visibility_config))
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
        )

    # Toggle visibility config
    old_visibility = challenge.visibility_config.is_visible if challenge.visibility_config else False
    if challenge.visibility_config:
        challenge.visibility_config.is_visible = (
            not challenge.visibility_config.is_visible
        )
    else:
        # Create visibility config if it doesn't exist
        visibility_config = ChallengeVisibilityConfig(
            challenge_id=challenge_id, is_visible=True
        )
        db.add(visibility_config)

    # If making visible, also mark as not draft
    if challenge.visibility_config and challenge.visibility_config.is_visible:
        challenge.is_draft = False

    new_visibility = challenge.visibility_config.is_visible if challenge.visibility_config else False
    db.commit()
    
    # Log visibility change
    log_audit(
        db=db,
        user_id=current_user.id,
        action="UPDATE",
        resource_type="challenge",
        resource_id=challenge_id,
        details={
            "action": "toggled_visibility",
            "challenge_title": challenge.title,
            "old_visibility": old_visibility,
            "new_visibility": new_visibility
        },
        request=request
    )

    return {
        "id": challenge_id,
        "is_visible": new_visibility,
        "message": "Visibility toggled successfully",
    }


@router.get("/admin/{challenge_id}", response_model=dict)
def get_challenge_admin(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
):
    """Get full challenge details for editing (admin only)."""
    challenge = (
        db.query(Challenge)
        .options(
            joinedload(Challenge.score_config),
            joinedload(Challenge.rule_config),
            joinedload(Challenge.visibility_config),
            joinedload(Challenge.flag),
        )
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    submission_count = (
        db.query(Submission).filter(Submission.challenge_id == challenge_id).count()
    )

    files = (
        db.query(ChallengeFile)
        .filter(ChallengeFile.challenge_id == challenge_id)
        .order_by(ChallengeFile.uploaded_at.desc())
        .all()
    )

    return {
        "id": challenge.id,
        "title": challenge.title,
        "description": challenge.description,
        "category_id": challenge.category_id,
        "difficulty_id": challenge.difficulty_id,
        "is_draft": challenge.is_draft,
        "is_visible": challenge.visibility_config.is_visible if challenge.visibility_config else False,
        "connection_info": challenge.operational_data,
        "flag_value": challenge.flag.flag_value if challenge.flag else None,
        "score_config": {
            "base_score": challenge.score_config.base_score if challenge.score_config else None,
            "scoring_mode": (challenge.score_config.scoring_mode.lower() if challenge.score_config else None),
            "decay_factor": challenge.score_config.decay_factor if challenge.score_config else None,
            "min_score": challenge.score_config.min_score if challenge.score_config else None,
        },
        "rule_config": {
            "attempt_limit": challenge.rule_config.attempt_limit if challenge.rule_config else None,
            "is_case_sensitive": challenge.rule_config.is_case_sensitive if challenge.rule_config else True,
        },
        "files": [
            {
                "id": f.id,
                "name": f.file_name,
                "size": f"{round(f.file_size_mb, 2)} MB" if f.file_size_mb is not None else "Unknown size",
                "type": f.file_type,
                "url": f"/api/v1/challenges/{challenge_id}/files/{f.id}/download",
            }
            for f in files
        ],
        "submission_count": submission_count,
    }


@router.patch("/admin/{challenge_id}", response_model=dict)
def update_challenge_admin(
    challenge_id: int,
    payload: ChallengeUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
):
    """Update challenge data (admin only)."""
    challenge = (
        db.query(Challenge)
        .options(
            joinedload(Challenge.score_config),
            joinedload(Challenge.rule_config),
            joinedload(Challenge.visibility_config),
            joinedload(Challenge.flag),
        )
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    submission_count = (
        db.query(Submission).filter(Submission.challenge_id == challenge_id).count()
    )

    scoring_locked = (challenge.visibility_config.is_visible if challenge.visibility_config else False) and submission_count > 0

    # Block scoring edits when locked
    if scoring_locked and payload.score_config:
        if any(
            [
                payload.score_config.base_score is not None,
                payload.score_config.scoring_mode is not None,
                payload.score_config.decay_factor is not None,
                payload.score_config.min_score is not None,
            ]
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot edit scoring while challenge is public and has submissions",
            )

    # Update basic fields
    for field in [
        "title",
        "description",
        "category_id",
        "difficulty_id",
        "is_draft",
    ]:
        value = getattr(payload, field)
        if value is not None:
            if field == "category_id":
                category = db.query(ChallengeCategory).filter(ChallengeCategory.id == value).first()
                if not category:
                    raise HTTPException(status_code=404, detail="Category not found")
                if not category.is_active:
                    raise HTTPException(status_code=400, detail="Cannot assign challenge to an inactive category")
            setattr(challenge, field, value)

    if payload.connection_info is not None:
        challenge.operational_data = payload.connection_info

    # Update flag
    if payload.flag_value is not None:
        if challenge.flag:
            challenge.flag.flag_value = payload.flag_value
        else:
            challenge.flag = ChallengeFlag(
                challenge_id=challenge.id, flag_value=payload.flag_value
            )

    # Update score config
    if payload.score_config and not scoring_locked:
        if not challenge.score_config:
            challenge.score_config = ChallengeScoreConfig(challenge_id=challenge.id)
        sc = payload.score_config
        if sc.base_score is not None:
            challenge.score_config.base_score = sc.base_score
        if sc.scoring_mode is not None:
            challenge.score_config.scoring_mode = sc.scoring_mode.upper()
        if sc.decay_factor is not None:
            challenge.score_config.decay_factor = sc.decay_factor
        if sc.min_score is not None:
            challenge.score_config.min_score = sc.min_score

    # Update rule config
    if payload.rule_config:
        if not challenge.rule_config:
            challenge.rule_config = ChallengeRuleConfig(challenge_id=challenge.id)
        rc = payload.rule_config
        if rc.attempt_limit is not None:
            challenge.rule_config.attempt_limit = rc.attempt_limit
        if rc.is_case_sensitive is not None:
            challenge.rule_config.is_case_sensitive = rc.is_case_sensitive

    # Update visibility
    if payload.visibility_config:
        if not challenge.visibility_config:
            challenge.visibility_config = ChallengeVisibilityConfig(
                challenge_id=challenge.id
            )
        vc = payload.visibility_config
        if vc.is_visible is not None:
            challenge.visibility_config.is_visible = vc.is_visible
            if vc.is_visible:
                challenge.is_draft = False

    db.commit()
    
    # Log challenge update
    log_audit(
        db=db,
        user_id=current_user.id,
        action="UPDATE",
        resource_type="challenge",
        resource_id=challenge.id,
        details={"action": "updated_challenge", "challenge_title": challenge.title},
        request=request
    )

    return {"id": challenge.id, "message": "Challenge updated successfully"}


@router.delete("/admin/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> None:
    """
    Delete a challenge (admin only).
    """
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
        )

    # Check if challenge has submissions
    from app.models.submission import Submission

    has_submissions = (
        db.query(Submission).filter(Submission.challenge_id == challenge_id).first()
        is not None
    )

    if has_submissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete challenge with submissions",
        )

    # Delete all related configs (they should cascade, but being explicit)
    db.query(ChallengeScoreConfig).filter(
        ChallengeScoreConfig.challenge_id == challenge_id
    ).delete()
    db.query(ChallengeRuleConfig).filter(
        ChallengeRuleConfig.challenge_id == challenge_id
    ).delete()
    db.query(ChallengeVisibilityConfig).filter(
        ChallengeVisibilityConfig.challenge_id == challenge_id
    ).delete()
    db.query(ChallengeFlag).filter(ChallengeFlag.challenge_id == challenge_id).delete()

    # Delete the challenge
    db.delete(challenge)
    db.commit()

    return None

@router.post("/admin/categories", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Create a new challenge category (admin only).
    """
    # Check if category already exists
    existing = db.query(ChallengeCategory).filter(
        ChallengeCategory.name == category_data["name"]
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category_data['name']}' already exists"
        )
    
    new_category = ChallengeCategory(
        name=category_data["name"],
        description=category_data.get("description"),
        is_active=category_data.get("is_active", True)
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return {
        "id": new_category.id,
        "name": new_category.name,
        "description": new_category.description,
        "message": "Category created successfully"
    }


@router.patch("/admin/categories/{category_id}", response_model=dict)
def update_category(
    category_id: int,
    category_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Update an existing challenge category (admin only).
    """
    category = db.query(ChallengeCategory).filter(
        ChallengeCategory.id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if new name conflicts with another category
    if "name" in category_data and category_data["name"] != category.name:
        existing = db.query(ChallengeCategory).filter(
            ChallengeCategory.name == category_data["name"],
            ChallengeCategory.id != category_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{category_data['name']}' already exists"
            )
        category.name = category_data["name"]
    
    if "description" in category_data:
        category.description = category_data.get("description")
    
    if "is_active" in category_data:
        category.is_active = category_data.get("is_active", True)
    
    db.commit()
    db.refresh(category)
    
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "message": "Category updated successfully"
    }


@router.delete("/admin/categories/{category_id}", response_model=dict)
def delete_category(
    category_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Delete a challenge category (admin only).
    Category can only be deleted if it has no challenges assigned.
    """
    category = db.query(ChallengeCategory).filter(
        ChallengeCategory.id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has any challenges
    challenge_count = db.query(Challenge).filter(
        Challenge.category_id == category_id
    ).count()
    
    if challenge_count > 0:
        # Hide category instead of deleting
        category.is_active = False
        db.commit()
        
        log_audit(
            db=db,
            user_id=current_user.id,
            action="UPDATE",
            resource_type="category",
            details={"action": "hide_category", "category_name": category.name, "reason": "has_challenges"},
            request=request
        )
        
        return {"message": f"Category '{category.name}' has been hidden because it has {challenge_count} challenges."}
    
    db.delete(category)
    db.commit()
    
    # Log category deletion
    log_audit(
        db=db,
        user_id=current_user.id,
        action="DELETE",
        resource_type="category",
        resource_id=category_id,
        details={"action": "deleted_category", "category_name": category.name},
        request=request
    )
    
    return {
        "id": category_id,
        "message": f"Category '{category.name}' deleted successfully"
    }

@router.post("/admin/{challenge_id}/files", response_model=dict)
async def upload_challenge_files(
    challenge_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
) -> Any:
    """
    Upload files for a challenge (admin only).
    """
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Check total size of existing files
    existing_files = db.query(ChallengeFile).filter(ChallengeFile.challenge_id == challenge_id).all()
    existing_filenames = {f.file_name for f in existing_files}
    current_total_mb = sum(f.file_size_mb for f in existing_files if f.file_size_mb)
    
    MAX_FILE_SIZE_MB = 100
    MAX_TOTAL_SIZE_MB = 500
    
    files_to_process = []
    processed_filenames = set()
    
    # First pass: validate sizes and read content
    for file in files:
        if file.filename in existing_filenames or file.filename in processed_filenames:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' already exists in this challenge."
            )
        processed_filenames.add(file.filename)

        content = await file.read()
        file_size_mb = len(content) / (1024 * 1024)
        
        if file_size_mb > MAX_FILE_SIZE_MB:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} exceeds the 100MB limit."
            )
            
        if current_total_mb + file_size_mb > MAX_TOTAL_SIZE_MB:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Total file size for this challenge would exceed 500MB."
            )
            
        current_total_mb += file_size_mb
        files_to_process.append((file, content, file_size_mb))
    
    # Create uploads directory if it doesn't exist
    upload_dir = f"uploads/challenges/{challenge_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    uploaded_files = []
    
    for file, content, file_size_mb in files_to_process:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Save to database
        challenge_file = ChallengeFile(
            challenge_id=challenge_id,
            file_path=file_path,
            file_name=file.filename,
            file_type=file.content_type,
            file_size_mb=round(file_size_mb, 2)
        )
        db.add(challenge_file)
        uploaded_files.append(file.filename)
    
    db.commit()
    
    return {
        "message": f"Successfully uploaded {len(uploaded_files)} file(s)",
        "files": uploaded_files
    }


@router.delete("/admin/{challenge_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge_file(
    challenge_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_admin),
):
    """Remove a file from a challenge (admin only)."""
    challenge_file = (
        db.query(ChallengeFile)
        .filter(
            ChallengeFile.id == file_id,
            ChallengeFile.challenge_id == challenge_id,
        )
        .first()
    )

    if not challenge_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Delete physical file if present
    try:
        if challenge_file.file_path and os.path.exists(challenge_file.file_path):
            os.remove(challenge_file.file_path)
    except OSError:
        # If deletion fails, continue with DB removal
        pass

    db.delete(challenge_file)
    db.commit()

    return None


@router.get("/{challenge_id}/files", response_model=List[dict])
def list_challenge_files(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    """List files for a challenge so the user can download them (auth required)."""
    files = (
        db.query(ChallengeFile)
        .filter(ChallengeFile.challenge_id == challenge_id)
        .order_by(ChallengeFile.uploaded_at.desc())
        .all()
    )

    results = []
    for f in files:
        size_label = f"{round(f.file_size_mb, 2)} MB" if f.file_size_mb is not None else "Unknown size"
        results.append(
            {
                "id": f.id,
                "name": f.file_name,
                "size": size_label,
                "type": f.file_type,
                "url": f"/api/v1/challenges/{challenge_id}/files/{f.id}/download",
            }
        )

    return results

@router.get("/{challenge_id}/files/{file_id}/download")
async def download_challenge_file(
    challenge_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    """Download a challenge file."""
    file = db.query(ChallengeFile).filter(
        ChallengeFile.id == file_id,
        ChallengeFile.challenge_id == challenge_id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file.file_path,
        filename=file.file_name,
        media_type=file.file_type
    )
