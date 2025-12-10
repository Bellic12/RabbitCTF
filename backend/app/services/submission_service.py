"""
Submission service for flag validation and scoring.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from dataclasses import dataclass

from app.models.submission import Submission
from app.models.challenge_flag import ChallengeFlag
from app.models.challenge_score_config import ChallengeScoreConfig
from app.models.user import User
from app.models.team import Team
from app.models.team_member import TeamMember
from app.services.challenge_service import ChallengeService
from app.core.enum import SubmissionStatus


@dataclass
class SubmissionResult:
    """Result of a flag submission."""

    is_correct: bool
    score_awarded: int = 0
    message: str = ""
    status: SubmissionStatus = SubmissionStatus.INCORRECT
    is_first_blood: bool = False


class SubmissionService:
    """Service for flag submission and validation."""

    def __init__(self, db: Session):
        self.db = db
        self.challenge_service = ChallengeService(db)

    def submit_flag(
        self, user: User, challenge_id: int, flag_value: str
    ) -> SubmissionResult:
        """
        Submit a flag for validation.

        Args:
            user: User submitting the flag
            challenge_id: ID of the challenge
            flag_value: Flag value submitted

        Returns:
            SubmissionResult with validation result and score
        """
        # Get challenge
        challenge = self.challenge_service.get_challenge_by_id(challenge_id)

        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
            )

        # Check if challenge is available (not a draft)
        if challenge.is_draft:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge is not available",
            )

        # Check visibility config if it exists
        if challenge.visibility_config:
            if not challenge.visibility_config.is_visible:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Challenge is not available",
                )

        # Get user's team
        team_membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )

        if not team_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must be in a team to submit flags",
            )

        team_id = team_membership.team_id

        # Check rate limit
        if not self._check_rate_limit(user.id, challenge_id):
            submission = Submission(
                challenge_id=challenge_id,
                user_id=user.id,
                team_id=team_id,
                submitted_flag="",
                is_correct=False,
            )
            self.db.add(submission)
            self.db.commit()

            return SubmissionResult(
                is_correct=False,
                message="Rate limit exceeded. Please wait before submitting again.",
                status=SubmissionStatus.RATE_LIMITED,
            )

        # Get challenge flag
        flag = (
            self.db.query(ChallengeFlag)
            .filter(ChallengeFlag.challenge_id == challenge_id)
            .first()
        )

        if not flag:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Challenge flag not configured",
            )

        # Validate flag (considering case sensitivity from rule_config)
        is_case_sensitive = True  # Default to case-sensitive
        
        if challenge.rule_config and hasattr(challenge.rule_config, 'is_case_sensitive'):
            is_case_sensitive = challenge.rule_config.is_case_sensitive
        
        # Compare flags directly (plain text comparison)
        # Strip whitespace from submitted flag
        flag_value = flag_value.strip()
        
        submitted_flag = flag_value if is_case_sensitive else flag_value.lower()
        stored_flag = flag.flag_value if is_case_sensitive else flag.flag_value.lower()
        is_correct = (submitted_flag == stored_flag)

        # Check if already solved by this team
        already_solved = (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge_id,
                Submission.team_id == team_id,
                Submission.is_correct == True,
            )
            .first()
            is not None
        )

        # Calculate score (only if first solve by this team)
        score_awarded = 0
        is_first_blood = False
        score_config = None

        if is_correct and not already_solved:
            # Get score configuration to check if dynamic scoring
            score_config = (
                self.db.query(ChallengeScoreConfig)
                .filter(ChallengeScoreConfig.challenge_id == challenge_id)
                .first()
            )
            is_dynamic = score_config and score_config.scoring_mode.lower() == "dynamic"
            
            # For dynamic scoring, score will be set by recalculate_dynamic_scores
            # For static scoring, calculate score now
            if not is_dynamic:
                score_awarded = self.challenge_service.calculate_current_score(challenge)

            # Check if this is first blood (first solve overall)
            first_solve = (
                self.db.query(Submission)
                .filter(
                    Submission.challenge_id == challenge_id,
                    Submission.is_correct == True,
                )
                .first()
            )

            is_first_blood = first_solve is None

            # For static scoring, update team score now
            # For dynamic scoring, skip this - recalculate_dynamic_scores will handle it
            if not is_dynamic:
                team = self.db.query(Team).filter(Team.id == team_id).first()
                if team:
                    team.total_score += score_awarded
                    self.db.add(team)

        # Create submission record
        submission = Submission(
            challenge_id=challenge_id,
            user_id=user.id,
            team_id=team_id,
            submitted_flag=flag_value,
            is_correct=is_correct,
            awarded_score=score_awarded,  # 0 for dynamic, actual score for static
        )

        self.db.add(submission)
        
        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            # If this is a duplicate constraint error and the challenge was already solved
            if "idx_submission_team_challenge_unique" in str(e) or "duplicate key" in str(e):
                # Return already solved message
                return SubmissionResult(
                    is_correct=is_correct,
                    score_awarded=0,
                    message="Challenge already solved by your team!",
                    status=SubmissionStatus.CORRECT if is_correct else SubmissionStatus.INCORRECT,
                    is_first_blood=False,
                )
            # Re-raise if it's a different error
            raise

        # If this is a correct submission for a dynamic scoring challenge,
        # recalculate all scores to reflect the new solve count
        if is_correct and not already_solved and score_config:
            if score_config.scoring_mode.lower() == "dynamic":
                # Recalculate all dynamic scores for this challenge
                self.challenge_service.recalculate_dynamic_scores(challenge_id)
                
                # Refresh submission to get updated awarded_score
                self.db.refresh(submission)
                score_awarded = submission.awarded_score

        # Prepare result message
        if is_correct:
            if already_solved:
                message = "Challenge already solved by your team!"
                status_enum = SubmissionStatus.CORRECT
            else:
                message = f"Correct! Your team earned {score_awarded} points!"
                if is_first_blood:
                    message += " 🩸 FIRST BLOOD!"
                status_enum = SubmissionStatus.CORRECT
        else:
            message = "Incorrect flag. Try again!"
            status_enum = SubmissionStatus.INCORRECT

        return SubmissionResult(
            is_correct=is_correct,
            score_awarded=score_awarded,
            message=message,
            status=status_enum,
            is_first_blood=is_first_blood,
        )

    def _check_rate_limit(self, user_id: int, challenge_id: int) -> bool:
        """
        Check if user has exceeded rate limit for submissions.

        Args:
            user_id: ID of the user
            challenge_id: ID of the challenge

        Returns:
            True if within rate limit, False otherwise
        """
        # Get submissions in last 60 seconds
        time_window = datetime.utcnow() - timedelta(seconds=60)

        recent_submissions = (
            self.db.query(Submission)
            .filter(
                Submission.user_id == user_id,
                Submission.challenge_id == challenge_id,
                Submission.submitted_at >= time_window,
            )
            .count()
        )

        # Allow max 3 submissions per minute per challenge
        MAX_SUBMISSIONS_PER_MINUTE = 3

        return recent_submissions < MAX_SUBMISSIONS_PER_MINUTE

    def get_user_submissions(
        self, user_id: int, skip: int = 0, limit: int = 100
    ) -> list[Submission]:
        """Get all submissions by a user."""
        return (
            self.db.query(Submission)
            .filter(Submission.user_id == user_id)
            .order_by(Submission.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_team_submissions(
        self, team_id: int, skip: int = 0, limit: int = 100
    ) -> list[Submission]:
        """Get all submissions by a team."""
        return (
            self.db.query(Submission)
            .filter(Submission.team_id == team_id)
            .order_by(Submission.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_challenge_submissions(
        self,
        challenge_id: int,
        correct_only: bool = False,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Submission]:
        """Get all submissions for a challenge."""
        query = self.db.query(Submission).filter(
            Submission.challenge_id == challenge_id
        )

        if correct_only:
            query = query.filter(Submission.is_correct == True)

        return (
            query.order_by(Submission.submitted_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
