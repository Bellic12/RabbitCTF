"""
Leaderboard service for rankings and statistics.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any

from app.models.team import Team
from app.models.user import User
from app.models.submission import Submission
from app.models.challenge import Challenge
from app.models.team_member import TeamMember


class LeaderboardService:
    """Service for leaderboard and statistics."""

    def __init__(self, db: Session):
        self.db = db

    def get_team_leaderboard(
        self, limit: int = 10, skip: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get team leaderboard with detailed stats.

        Args:
            limit: Number of teams to return
            skip: Number of teams to skip (pagination)

        Returns:
            List of teams with scores and stats
        """
        teams = (
            self.db.query(Team)
            .order_by(desc(Team.total_score))
            .offset(skip)
            .limit(limit)
            .all()
        )

        leaderboard = []
        for rank, team in enumerate(teams, start=skip + 1):
            # Get solve count
            solve_count = (
                self.db.query(Submission)
                .filter(Submission.team_id == team.id, Submission.is_correct is True)
                .distinct(Submission.challenge_id)
                .count()
            )

            # Get member count
            member_count = (
                self.db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
            )

            # Get last solve time
            last_solve = (
                self.db.query(Submission.submitted_at)
                .filter(Submission.team_id == team.id, Submission.is_correct is True)
                .order_by(desc(Submission.submitted_at))
                .first()
            )

            leaderboard.append(
                {
                    "rank": rank,
                    "team_id": team.id,
                    "team_name": team.name,
                    "total_score": team.total_score,
                    "challenges_solved": solve_count,
                    "members": member_count,
                    "last_solve_at": last_solve[0] if last_solve else None,
                }
            )

        return leaderboard

    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """
        Get detailed statistics for a user.

        Args:
            user_id: ID of the user

        Returns:
            Dictionary with user stats
        """
        user = self.db.query(User).filter(User.id == user_id).first()

        if not user:
            return {}

        # Get team membership
        team_membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
        )

        team = None
        team_rank = None
        if team_membership:
            team = (
                self.db.query(Team).filter(Team.id == team_membership.team_id).first()
            )

            # Calculate team rank
            if team:
                higher_ranked = (
                    self.db.query(Team)
                    .filter(Team.total_score > team.total_score)
                    .count()
                )
                team_rank = higher_ranked + 1

        # Get submission stats
        total_submissions = (
            self.db.query(Submission).filter(Submission.user_id == user_id).count()
        )

        correct_submissions = (
            self.db.query(Submission)
            .filter(Submission.user_id == user_id, Submission.is_correct is True)
            .distinct(Submission.challenge_id)
            .count()
        )

        # Get first blood count
        first_bloods = 0
        if team_membership:
            # Count challenges where this user's team was first
            user_submissions = (
                self.db.query(Submission)
                .filter(Submission.user_id == user_id, Submission.is_correct is True)
                .all()
            )

            for sub in user_submissions:
                first_solve = (
                    self.db.query(Submission)
                    .filter(
                        Submission.challenge_id == sub.challenge_id,
                        Submission.is_correct is True,
                    )
                    .order_by(Submission.submitted_at.asc())
                    .first()
                )

                if first_solve and first_solve.user_id == user_id:
                    first_bloods += 1

        return {
            "user_id": user.id,
            "username": user.username,
            "team_id": team.id if team else None,
            "team_name": team.name if team else None,
            "team_rank": team_rank,
            "team_score": team.total_score if team else 0,
            "challenges_solved": correct_submissions,
            "total_submissions": total_submissions,
            "first_bloods": first_bloods,
            "accuracy": round(correct_submissions / total_submissions * 100, 2)
            if total_submissions > 0
            else 0,
        }

    def get_team_stats(self, team_id: int) -> Dict[str, Any]:
        """
        Get detailed statistics for a team.

        Args:
            team_id: ID of the team

        Returns:
            Dictionary with team stats
        """
        team = self.db.query(Team).filter(Team.id == team_id).first()

        if not team:
            return {}

        # Calculate rank
        higher_ranked = (
            self.db.query(Team).filter(Team.total_score > team.total_score).count()
        )
        rank = higher_ranked + 1

        # Get solve count
        solves = (
            self.db.query(Submission)
            .filter(Submission.team_id == team_id, Submission.is_correct is True)
            .distinct(Submission.challenge_id)
            .count()
        )

        # Get total attempts
        attempts = (
            self.db.query(Submission).filter(Submission.team_id == team_id).count()
        )

        # Get members
        members = (
            self.db.query(User)
            .join(TeamMember)
            .filter(TeamMember.team_id == team_id)
            .all()
        )

        # Get captain
        captain = self.db.query(User).filter(User.id == team.captain_id).first()

        # Get first bloods
        first_bloods = 0
        team_submissions = (
            self.db.query(Submission)
            .filter(Submission.team_id == team_id, Submission.is_correct is True)
            .all()
        )

        for sub in team_submissions:
            first_solve = (
                self.db.query(Submission)
                .filter(
                    Submission.challenge_id == sub.challenge_id,
                    Submission.is_correct is True,
                )
                .order_by(Submission.submitted_at.asc())
                .first()
            )

            if first_solve and first_solve.team_id == team_id:
                first_bloods += 1

        return {
            "team_id": team.id,
            "team_name": team.name,
            "rank": rank,
            "total_score": team.total_score,
            "challenges_solved": solves,
            "total_attempts": attempts,
            "first_bloods": first_bloods,
            "captain": {"id": captain.id, "username": captain.username}
            if captain
            else None,
            "members": [{"id": m.id, "username": m.username} for m in members],
            "member_count": len(members),
        }

    def get_challenge_stats(self, challenge_id: int) -> Dict[str, Any]:
        """
        Get statistics for a specific challenge.

        Args:
            challenge_id: ID of the challenge

        Returns:
            Dictionary with challenge stats
        """
        challenge = (
            self.db.query(Challenge).filter(Challenge.id == challenge_id).first()
        )

        if not challenge:
            return {}

        # Get solve count
        solves = (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge_id, Submission.is_correct is True
            )
            .distinct(Submission.team_id)
            .count()
        )

        # Get total attempts
        attempts = (
            self.db.query(Submission)
            .filter(Submission.challenge_id == challenge_id)
            .count()
        )

        # Get first blood
        first_blood = (
            self.db.query(Submission)
            .filter(
                Submission.challenge_id == challenge_id, Submission.is_correct is True
            )
            .order_by(Submission.submitted_at.asc())
            .first()
        )

        return {
            "challenge_id": challenge.id,
            "title": challenge.title,
            "base_score": challenge.base_score,
            "solves": solves,
            "attempts": attempts,
            "solve_rate": round(solves / attempts * 100, 2) if attempts > 0 else 0,
            "first_blood": {
                "team_id": first_blood.team_id,
                "user_id": first_blood.user_id,
                "solved_at": first_blood.submitted_at,
            }
            if first_blood
            else None,
        }

    def get_platform_stats(self) -> Dict[str, Any]:
        """
        Get overall platform statistics.

        Returns:
            Dictionary with platform-wide stats
        """
        return {
            "total_teams": self.db.query(Team).count(),
            "total_users": self.db.query(User).count(),
            "total_challenges": self.db.query(Challenge)
            .filter(Challenge.is_visible is True)
            .count(),
            "total_submissions": self.db.query(Submission).count(),
            "correct_submissions": self.db.query(Submission)
            .filter(Submission.is_correct is True)
            .count(),
        }
