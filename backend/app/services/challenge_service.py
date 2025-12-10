"""
Challenge service for business logic.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.challenge import Challenge
from app.models.challenge_flag import ChallengeFlag
from app.models.challenge_score_config import ChallengeScoreConfig
from app.models.submission import Submission
from app.models.user import User
from app.schemas.challenges import ChallengeCreate, ChallengeUpdate
from app.core.scoring import get_scoring_strategy


class ChallengeService:
    """Service for challenge-related operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_challenge(
        self, challenge_data: ChallengeCreate, admin: User
    ) -> Challenge:
        """
        Create a new challenge.

        Args:
            challenge_data: Challenge creation data
            admin: Admin user creating the challenge

        Returns:
            Created challenge
        """
        # Create challenge
        new_challenge = Challenge(
            title=challenge_data.title,
            description=challenge_data.description,
            category_id=challenge_data.category_id,
            difficulty_id=challenge_data.difficulty_id,
            base_score=challenge_data.base_score,
            is_visible=not challenge_data.is_draft,
            is_draft=challenge_data.is_draft,
            created_by_id=admin.id,
        )

        self.db.add(new_challenge)
        self.db.flush()  # Get challenge.id

        # Create flag
        flag = ChallengeFlag(
            challenge_id=new_challenge.id,
            flag_value=challenge_data.flag,
            is_case_sensitive=challenge_data.is_case_sensitive,
        )
        self.db.add(flag)

        self.db.commit()
        self.db.refresh(new_challenge)

        return new_challenge

    def update_challenge(
        self, challenge_id: int, challenge_data: ChallengeUpdate, admin: User
    ) -> Challenge:
        """
        Update an existing challenge.

        Args:
            challenge_id: ID of challenge to update
            challenge_data: Updated challenge data
            admin: Admin user updating the challenge

        Returns:
            Updated challenge

        Raises:
            HTTPException: If challenge not found
        """
        challenge = self.get_challenge_by_id(challenge_id)

        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
            )

        # Check if challenge has submissions
        has_submissions = (
            self.db.query(Submission)
            .filter(Submission.challenge_id == challenge_id)
            .first()
            is not None
        )

        # Update fields if provided
        update_data = challenge_data.dict(exclude_unset=True)

        # Prevent scoring-related changes if challenge has submissions
        scoring_fields = {"base_score", "scoring_mode", "decay_factor", "min_score"}
        attempted_scoring_changes = scoring_fields & set(update_data.keys())
        
        if has_submissions and attempted_scoring_changes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot modify scoring configuration ({', '.join(attempted_scoring_changes)}) "
                       f"for challenges with existing submissions. This ensures fairness and score integrity."
            )

        for field, value in update_data.items():
            if field == "flag" and value:
                # Update flag value
                flag = (
                    self.db.query(ChallengeFlag)
                    .filter(ChallengeFlag.challenge_id == challenge_id)
                    .first()
                )
                if flag:
                    flag.flag_value = value
            elif field == "is_case_sensitive" and value is not None:
                # Update flag case sensitivity
                flag = (
                    self.db.query(ChallengeFlag)
                    .filter(ChallengeFlag.challenge_id == challenge_id)
                    .first()
                )
                if flag:
                    flag.is_case_sensitive = value
            elif field in {"scoring_mode", "decay_factor", "min_score"}:
                # Update scoring config
                score_config = (
                    self.db.query(ChallengeScoreConfig)
                    .filter(ChallengeScoreConfig.challenge_id == challenge_id)
                    .first()
                )
                if score_config:
                    if field == "scoring_mode":
                        score_config.scoring_mode = value
                    elif field == "decay_factor":
                        score_config.decay_factor = value
                    elif field == "min_score":
                        score_config.min_score = value
            elif field == "base_score":
                # Update base_score in both challenge and score_config
                challenge.base_score = value
                score_config = (
                    self.db.query(ChallengeScoreConfig)
                    .filter(ChallengeScoreConfig.challenge_id == challenge_id)
                    .first()
                )
                if score_config:
                    score_config.base_score = value
            elif hasattr(challenge, field):
                setattr(challenge, field, value)

        self.db.commit()
        self.db.refresh(challenge)

        return challenge

    def get_visible_challenges(
        self, skip: int = 0, limit: int = 100
    ) -> List[Challenge]:
        """Get all visible (non-draft) challenges."""
        return (
            self.db.query(Challenge)
            .filter(Challenge.is_visible is True, Challenge.is_draft is False)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all_challenges(self, skip: int = 0, limit: int = 100) -> List[Challenge]:
        """Get all challenges (including drafts) - admin only."""
        return self.db.query(Challenge).offset(skip).limit(limit).all()

    def get_challenge_by_id(self, challenge_id: int) -> Optional[Challenge]:
        """Get challenge by ID."""
        return self.db.query(Challenge).filter(Challenge.id == challenge_id).first()

    def get_challenges_by_category(
        self, category_id: int, skip: int = 0, limit: int = 100
    ) -> List[Challenge]:
        """Get challenges by category."""
        return (
            self.db.query(Challenge)
            .filter(
                Challenge.category_id == category_id,
                Challenge.is_visible is True,
                Challenge.is_draft is False,
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def calculate_current_score(self, challenge: Challenge) -> int:
        """
        Calculate current score for a challenge based on solve count using Strategy Pattern.

        Args:
            challenge: Challenge to calculate score for

        Returns:
            Current score value based on scoring strategy
        """
        # Get solve count (count distinct teams that solved it)
        solve_count = (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge.id, Submission.is_correct is True
            )
            .distinct(Submission.team_id)
            .count()
        )

        # Get challenge score configuration
        score_config = (
            self.db.query(ChallengeScoreConfig)
            .filter(ChallengeScoreConfig.challenge_id == challenge.id)
            .first()
        )

        # Use default values if no config exists
        if not score_config:
            strategy = get_scoring_strategy("static")
            return strategy.calculate_score(
                base_score=challenge.base_score or 100,
                solve_count=solve_count,
                decay=0.9,
                min_score=10
            )

        # Use Strategy Pattern with configuration
        strategy = get_scoring_strategy(score_config.scoring_mode.lower())
        return strategy.calculate_score(
            base_score=score_config.base_score,
            solve_count=solve_count,
            decay=score_config.decay_factor or 0.9,
            min_score=score_config.min_score or 10
        )

    def toggle_visibility(self, challenge_id: int, admin: User) -> Challenge:
        """
        Toggle challenge visibility (publish/unpublish).

        Args:
            challenge_id: ID of challenge
            admin: Admin user performing action

        Returns:
            Updated challenge
        """
        challenge = self.get_challenge_by_id(challenge_id)

        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
            )

        challenge.is_visible = not challenge.is_visible

        # If making visible, also mark as not draft
        if challenge.is_visible:
            challenge.is_draft = False

        self.db.commit()
        self.db.refresh(challenge)

        return challenge

    def delete_challenge(self, challenge_id: int, admin: User) -> None:
        """
        Delete a challenge.

        Args:
            challenge_id: ID of challenge to delete
            admin: Admin user performing action

        Raises:
            HTTPException: If challenge not found or has submissions
        """
        challenge = self.get_challenge_by_id(challenge_id)

        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
            )

        # Check if challenge has submissions
        has_submissions = (
            self.db.query(Submission)
            .filter(Submission.challenge_id == challenge_id)
            .first()
            is not None
        )

        if has_submissions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete challenge with submissions. Mark as draft instead.",
            )

        # Delete flag first (foreign key constraint)
        self.db.query(ChallengeFlag).filter(
            ChallengeFlag.challenge_id == challenge_id
        ).delete()

        self.db.delete(challenge)
        self.db.commit()

    def get_solve_count(self, challenge_id: int) -> int:
        """Get number of teams that solved the challenge."""
        return (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge_id, Submission.is_correct is True
            )
            .distinct(Submission.team_id)
            .count()
        )

    def get_first_blood(self, challenge_id: int) -> Optional[Submission]:
        """Get the first correct submission for a challenge."""
        return (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge_id, Submission.is_correct is True
            )
            .order_by(Submission.submitted_at.asc())
            .first()
        )

    def recalculate_dynamic_scores(self, challenge_id: int) -> dict:
        """
        Recalculate all dynamic scores for a challenge and update team totals.
        
        This method:
        1. Gets all correct submissions for the challenge ordered by time
        2. Recalculates each submission's score based on its position
        3. Updates awarded_score for each submission
        4. Recalculates total_score for all affected teams
        
        Args:
            challenge_id: ID of the challenge to recalculate
            
        Returns:
            Dictionary with recalculation statistics
            
        Raises:
            HTTPException: If challenge not found or not dynamic scoring
        """
        from app.models.team import Team
        
        challenge = self.get_challenge_by_id(challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Get score configuration
        score_config = (
            self.db.query(ChallengeScoreConfig)
            .filter(ChallengeScoreConfig.challenge_id == challenge_id)
            .first()
        )
        
        # Only recalculate for dynamic scoring
        if not score_config or score_config.scoring_mode.lower() != "dynamic":
            return {
                "recalculated": 0,
                "message": "Challenge does not use dynamic scoring"
            }
        
        # Get all correct submissions ordered by submission time
        correct_submissions = (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge_id,
                Submission.is_correct == True
            )
            .order_by(Submission.submitted_at.asc(), Submission.id.asc())
            .all()
        )
        
        if not correct_submissions:
            return {
                "recalculated": 0,
                "message": "No correct submissions found"
            }
        
        # Get scoring strategy
        strategy = get_scoring_strategy(score_config.scoring_mode.lower())
        base_score = score_config.base_score
        decay = score_config.decay_factor or 0.9
        min_score = score_config.min_score or 10
        
        # Track team score changes
        team_score_deltas = {}  # team_id -> score_delta
        
        # Recalculate each submission
        for index, submission in enumerate(correct_submissions):
            old_score = submission.awarded_score or 0
            
            # Calculate new score based on position (solve_count = index)
            new_score = strategy.calculate_score(
                base_score=base_score,
                solve_count=index,
                decay=decay,
                min_score=min_score
            )
            
            # Update submission
            submission.awarded_score = new_score
            
            # Track the delta for team total_score update
            score_delta = new_score - old_score
            team_id = submission.team_id
            if team_id not in team_score_deltas:
                team_score_deltas[team_id] = 0
            team_score_deltas[team_id] += score_delta
        
        # Update team total_scores efficiently
        for team_id, delta in team_score_deltas.items():
            team = self.db.query(Team).filter(Team.id == team_id).first()
            if team:
                team.total_score = (team.total_score or 0) + delta
        
        # Commit all changes
        self.db.commit()
        
        return {
            "recalculated": len(correct_submissions),
            "teams_affected": len(team_score_deltas),
            "score_deltas": team_score_deltas,
            "message": f"Successfully recalculated {len(correct_submissions)} submissions for {len(team_score_deltas)} teams"
        }
