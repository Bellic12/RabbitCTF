"""
Submission endpoints for RabbitCTF.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.schemas.submissions import (
    SubmissionBase,
    SubmissionResponse,
    SubmissionDetailResponse,
    SubmissionHistoryResponse,
    SubmissionStatsResponse,
    TeamSubmissionStats,
    FirstBloodResponse,
    SolveTimelineResponse,
    SolveTimelineEntry,
    UserSubmissionStatus,
    SubmissionBlockResponse,
)
from app.services.submission_service import SubmissionService
from app.models.user import User
from app.models.team_member import TeamMember
from app.models.submission import Submission
from app.models.challenge import Challenge
from app.models.team import Team

router = APIRouter()


# =============================================
# PUBLIC SUBMISSION ENDPOINTS
# =============================================


@router.post(
    "/submit",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Submit a flag for a challenge",
)
async def submit_flag(
    submission_data: SubmissionBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit a flag for validation.

    - **challenge_id**: ID of the challenge
    - **submitted_flag_hash**: The flag value you want to submit

    Returns validation result and score if correct.
    """
    submission_service = SubmissionService(db)

    result = submission_service.submit_flag(
        user=current_user,
        challenge_id=submission_data.challenge_id,
        flag_value=submission_data.submitted_flag_hash,
    )

    return {
        "is_correct": result.is_correct,
        "score_awarded": result.score_awarded,
        "message": result.message,
        "status": result.status.value,
        "is_first_blood": result.is_first_blood,
    }


@router.get(
    "/my-submissions",
    response_model=List[SubmissionResponse],
    summary="Get your submission history",
)
async def get_my_submissions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all your submissions.

    Returns a list of your submissions ordered by most recent first.
    """
    submission_service = SubmissionService(db)
    submissions = submission_service.get_user_submissions(
        user_id=current_user.id, skip=skip, limit=limit
    )

    # Enrich with challenge and team names
    response = []
    for sub in submissions:
        challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()
        team = db.query(Team).filter(Team.id == sub.team_id).first()

        response.append(
            SubmissionResponse(
                id=sub.id,
                user_id=sub.user_id,
                username=current_user.username,
                team_id=sub.team_id,
                team_name=team.team_name if team else None,
                challenge_id=sub.challenge_id,
                challenge_title=challenge.title if challenge else None,
                is_correct=sub.is_correct,
                awarded_score=sub.awarded_score,
                submitted_at=sub.submitted_at,
            )
        )

    return response


@router.get(
    "/team-submissions",
    response_model=List[SubmissionResponse],
    summary="Get your team's submission history",
)
async def get_team_submissions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all submissions from your team.

    Returns a list of team submissions ordered by most recent first.
    """
    # Get user's team
    team_membership = (
        db.query(TeamMember).filter(TeamMember.user_id == current_user.id).first()
    )

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not in a team",
        )

    submission_service = SubmissionService(db)
    submissions = submission_service.get_team_submissions(
        team_id=team_membership.team_id, skip=skip, limit=limit
    )

    # Enrich with user, challenge, and team names
    response = []
    for sub in submissions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()
        team = db.query(Team).filter(Team.id == sub.team_id).first()

        response.append(
            SubmissionResponse(
                id=sub.id,
                user_id=sub.user_id,
                username=user.username if user else None,
                team_id=sub.team_id,
                team_name=team.team_name if team else None,
                challenge_id=sub.challenge_id,
                challenge_title=challenge.title if challenge else None,
                is_correct=sub.is_correct,
                awarded_score=sub.awarded_score,
                submitted_at=sub.submitted_at,
            )
        )

    return response


@router.get(
    "/challenge/{challenge_id}/status",
    response_model=UserSubmissionStatus,
    summary="Get your submission status for a challenge",
)
async def get_challenge_status(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get your submission status for a specific challenge.

    Returns information about attempts made, remaining attempts, and solve status.
    """
    # Check if challenge exists
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    # Get user's team
    team_membership = (
        db.query(TeamMember).filter(TeamMember.user_id == current_user.id).first()
    )

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must be in a team",
        )

    # Get submissions
    submissions = (
        db.query(Submission)
        .filter(
            Submission.challenge_id == challenge_id,
            Submission.user_id == current_user.id,
        )
        .order_by(Submission.submitted_at.desc())
        .all()
    )

    attempts_made = len(submissions)
    has_solved = any(sub.is_correct for sub in submissions)
    last_attempt_at = submissions[0].submitted_at if submissions else None

    return UserSubmissionStatus(
        challenge_id=challenge_id,
        attempts_made=attempts_made,
        attempts_remaining=999,  # You can implement a limit if needed
        is_blocked=False,  # Implement blocking logic if needed
        blocked_until=None,
        has_solved=has_solved,
        last_attempt_at=last_attempt_at,
    )


@router.get(
    "/first-bloods",
    response_model=List[FirstBloodResponse],
    summary="Get first blood achievements",
)
async def get_first_bloods(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of records"),
    db: Session = Depends(get_db),
):
    """
    Get first blood (first solve) achievements.

    Returns a list of challenges with their first solvers.
    """
    # Get first correct submission for each challenge
    from sqlalchemy import func

    subquery = (
        db.query(
            Submission.challenge_id,
            func.min(Submission.submitted_at).label("first_solve_time"),
        )
        .filter(Submission.is_correct == True)
        .group_by(Submission.challenge_id)
        .subquery()
    )

    first_bloods = (
        db.query(Submission)
        .join(
            subquery,
            (Submission.challenge_id == subquery.c.challenge_id)
            & (Submission.submitted_at == subquery.c.first_solve_time),
        )
        .order_by(Submission.submitted_at.desc())
        .limit(limit)
        .all()
    )

    response = []
    for fb in first_bloods:
        challenge = db.query(Challenge).filter(Challenge.id == fb.challenge_id).first()
        team = db.query(Team).filter(Team.id == fb.team_id).first()
        user = db.query(User).filter(User.id == fb.user_id).first()

        if challenge and team and user:
            # Calculate time to solve if challenge has release time
            time_to_solve = None
            if challenge.created_at:
                time_diff = fb.submitted_at - challenge.created_at
                time_to_solve = int(time_diff.total_seconds() / 60)

            response.append(
                FirstBloodResponse(
                    challenge_id=challenge.id,
                    challenge_title=challenge.title,
                    team_id=team.id,
                    team_name=team.team_name,
                    user_id=user.id,
                    username=user.username,
                    solved_at=fb.submitted_at,
                    time_to_solve=time_to_solve,
                )
            )

    return response


@router.get(
    "/solve-timeline",
    response_model=SolveTimelineResponse,
    summary="Get solve timeline",
)
async def get_solve_timeline(
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    db: Session = Depends(get_db),
):
    """
    Get chronological timeline of all challenge solves.

    Returns all correct submissions in chronological order.
    """
    from app.models.challenge_category import ChallengeCategory
    from app.models.difficulty import Difficulty

    submissions = (
        db.query(Submission)
        .filter(Submission.is_correct == True)
        .order_by(Submission.submitted_at.desc())
        .limit(limit)
        .all()
    )

    timeline = []
    for sub in submissions:
        challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()
        team = db.query(Team).filter(Team.id == sub.team_id).first()

        if challenge and team:
            category = (
                db.query(ChallengeCategory)
                .filter(ChallengeCategory.id == challenge.category_id)
                .first()
            )
            difficulty = (
                db.query(Difficulty)
                .filter(Difficulty.id == challenge.difficulty_id)
                .first()
            )

            timeline.append(
                SolveTimelineEntry(
                    team_id=team.id,
                    team_name=team.team_name,
                    challenge_id=challenge.id,
                    challenge_title=challenge.title,
                    category_name=category.name if category else "Unknown",
                    difficulty_name=difficulty.name if difficulty else "Unknown",
                    score_awarded=sub.awarded_score or 0,
                    solved_at=sub.submitted_at,
                )
            )

    return SolveTimelineResponse(total_solves=len(timeline), timeline=timeline)


# =============================================
# ADMIN SUBMISSION ENDPOINTS
# =============================================


@router.get(
    "/admin/all",
    response_model=List[SubmissionDetailResponse],
    summary="[Admin] Get all submissions",
    dependencies=[Depends(get_current_admin)],
)
async def admin_get_all_submissions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    correct_only: bool = Query(False, description="Only show correct submissions"),
    db: Session = Depends(get_db),
):
    """
    [Admin Only] Get all submissions in the system.

    Includes detailed information including submitted flag hashes.
    """
    query = db.query(Submission)

    if correct_only:
        query = query.filter(Submission.is_correct == True)

    submissions = (
        query.order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
    )

    response = []
    for sub in submissions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        team = db.query(Team).filter(Team.id == sub.team_id).first()
        challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()

        response.append(
            SubmissionDetailResponse(
                id=sub.id,
                user_id=sub.user_id,
                username=user.username if user else None,
                team_id=sub.team_id,
                team_name=team.team_name if team else None,
                challenge_id=sub.challenge_id,
                challenge_title=challenge.title if challenge else None,
                is_correct=sub.is_correct,
                awarded_score=sub.awarded_score,
                submitted_at=sub.submitted_at,
                submitted_flag_hash=sub.submitted_flag_hash,
                ip_address=None,  # Add if you track IP addresses
            )
        )

    return response


@router.get(
    "/admin/challenge/{challenge_id}",
    response_model=List[SubmissionDetailResponse],
    summary="[Admin] Get submissions for a challenge",
    dependencies=[Depends(get_current_admin)],
)
async def admin_get_challenge_submissions(
    challenge_id: int,
    correct_only: bool = Query(False, description="Only show correct submissions"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    db: Session = Depends(get_db),
):
    """
    [Admin Only] Get all submissions for a specific challenge.

    Includes detailed information for analysis.
    """
    submission_service = SubmissionService(db)
    submissions = submission_service.get_challenge_submissions(
        challenge_id=challenge_id,
        correct_only=correct_only,
        skip=skip,
        limit=limit,
    )

    response = []
    for sub in submissions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        team = db.query(Team).filter(Team.id == sub.team_id).first()
        challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()

        response.append(
            SubmissionDetailResponse(
                id=sub.id,
                user_id=sub.user_id,
                username=user.username if user else None,
                team_id=sub.team_id,
                team_name=team.team_name if team else None,
                challenge_id=sub.challenge_id,
                challenge_title=challenge.title if challenge else None,
                is_correct=sub.is_correct,
                awarded_score=sub.awarded_score,
                submitted_at=sub.submitted_at,
                submitted_flag_hash=sub.submitted_flag_hash,
                ip_address=None,
            )
        )

    return response


@router.get(
    "/admin/stats/challenge/{challenge_id}",
    response_model=SubmissionStatsResponse,
    summary="[Admin] Get challenge statistics",
    dependencies=[Depends(get_current_admin)],
)
async def admin_get_challenge_stats(
    challenge_id: int,
    db: Session = Depends(get_db),
):
    """
    [Admin Only] Get detailed statistics for a challenge.

    Includes solve counts, average attempts, and recent activity.
    """
    from sqlalchemy import func, distinct

    # Check if challenge exists
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    # Total submissions
    total_submissions = (
        db.query(func.count(Submission.id))
        .filter(Submission.challenge_id == challenge_id)
        .scalar()
    )

    # Unique solvers (teams)
    unique_solvers = (
        db.query(func.count(distinct(Submission.team_id)))
        .filter(Submission.challenge_id == challenge_id, Submission.is_correct == True)
        .scalar()
    )

    # Average attempts before solving
    solved_teams = (
        db.query(Submission.team_id)
        .filter(Submission.challenge_id == challenge_id, Submission.is_correct == True)
        .distinct()
        .all()
    )

    if solved_teams:
        total_attempts = 0
        for (team_id,) in solved_teams:
            attempts = (
                db.query(func.count(Submission.id))
                .filter(
                    Submission.challenge_id == challenge_id,
                    Submission.team_id == team_id,
                    Submission.submitted_at
                    <= db.query(Submission.submitted_at)
                    .filter(
                        Submission.challenge_id == challenge_id,
                        Submission.team_id == team_id,
                        Submission.is_correct == True,
                    )
                    .order_by(Submission.submitted_at.asc())
                    .limit(1)
                    .scalar_subquery(),
                )
                .scalar()
            )
            total_attempts += attempts
        average_attempts = total_attempts / len(solved_teams) if solved_teams else 0
    else:
        average_attempts = 0

    # Fastest solve time
    first_solve = (
        db.query(Submission)
        .filter(Submission.challenge_id == challenge_id, Submission.is_correct == True)
        .order_by(Submission.submitted_at.asc())
        .first()
    )

    fastest_solve_time = None
    if first_solve and challenge.created_at:
        time_diff = first_solve.submitted_at - challenge.created_at
        fastest_solve_time = int(time_diff.total_seconds() / 60)

    # Recent activity
    recent_submissions = (
        db.query(Submission)
        .filter(Submission.challenge_id == challenge_id)
        .order_by(Submission.submitted_at.desc())
        .limit(10)
        .all()
    )

    recent_activity = []
    for sub in recent_submissions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        team = db.query(Team).filter(Team.id == sub.team_id).first()

        recent_activity.append(
            SubmissionResponse(
                id=sub.id,
                user_id=sub.user_id,
                username=user.username if user else None,
                team_id=sub.team_id,
                team_name=team.team_name if team else None,
                challenge_id=sub.challenge_id,
                challenge_title=challenge.title,
                is_correct=sub.is_correct,
                awarded_score=sub.awarded_score,
                submitted_at=sub.submitted_at,
            )
        )

    return SubmissionStatsResponse(
        total_submissions=total_submissions or 0,
        unique_solvers=unique_solvers or 0,
        average_attempts=average_attempts,
        fastest_solve_time=fastest_solve_time,
        recent_activity=recent_activity,
    )


@router.delete(
    "/admin/{submission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Delete a submission",
    dependencies=[Depends(get_current_admin)],
)
async def admin_delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
):
    """
    [Admin Only] Delete a submission.

    Warning: This will affect team scores if the submission was correct.
    """
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    # If submission was correct, deduct score from team
    if submission.is_correct and submission.awarded_score:
        team = db.query(Team).filter(Team.id == submission.team_id).first()
        if team:
            team.total_score = max(0, team.total_score - submission.awarded_score)
            db.add(team)

    db.delete(submission)
    db.commit()

    return None
