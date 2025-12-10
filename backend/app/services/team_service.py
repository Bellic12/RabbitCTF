"""
Team service for business logic.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_credential import TeamCredential
from app.models.user import User
from app.models.submission import Submission
from app.models.challenge import Challenge
from app.models.challenge_category import ChallengeCategory
from app.models.event_config import EventConfig
from app.schemas.teams import TeamCreate, TeamJoin, TeamDetailResponse, TeamMemberResponse, SolvedChallengeResponse
from app.core.security import get_password_hash, verify_password


class TeamService:
    """Service for team-related operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_team(self, team_data: TeamCreate, captain: User) -> Team:
        """
        Create a new team with the given user as captain.

        Args:
            team_data: Team creation data
            captain: User who will be the captain

        Returns:
            Created team

        Raises:
            HTTPException: If team name already exists or user already in team
        """
        # Check if team name exists
        existing_team = self.db.query(Team).filter(Team.name == team_data.name).first()

        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name already exists",
            )

        # Check if user is already in a team
        existing_membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == captain.id).first()
        )

        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already in a team",
            )

        # Create team
        new_team = Team(name=team_data.name, captain_id=captain.id, total_score=0)

        self.db.add(new_team)
        self.db.flush()  # Get team.id

        # Hash team password
        team_credential = TeamCredential(
            team_id=new_team.id, password_hash=get_password_hash(team_data.password)
        )
        self.db.add(team_credential)

        # Add captain as first member
        captain_member = TeamMember(team_id=new_team.id, user_id=captain.id)
        self.db.add(captain_member)

        self.db.commit()
        self.db.refresh(new_team)

        return new_team

    def join_team(self, join_data: TeamJoin, user: User) -> Team:
        """
        Add user to an existing team.

        Args:
            join_data: Team join data (name + password)
            user: User who wants to join

        Returns:
            Team that user joined

        Raises:
            HTTPException: If team not found, wrong password, or user already in team
        """
        # Find team
        team = self.db.query(Team).filter(Team.name == join_data.team_name).first()

        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Team not found"
            )

        # Get team credential
        team_credential = (
            self.db.query(TeamCredential)
            .filter(TeamCredential.team_id == team.id)
            .first()
        )

        if not team_credential:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Team credentials not found",
            )

        # Verify password
        if not verify_password(join_data.password, team_credential.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect team password",
            )

        # Check if user already in a team
        existing_membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )

        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already in a team",
            )

        # Check team size limit
        event_config = self.db.query(EventConfig).first()
        max_team_size = event_config.max_team_size if event_config else 4

        current_size = (
            self.db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
        )

        if current_size >= max_team_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team is full (max {max_team_size} members)",
            )

        # Add member
        new_member = TeamMember(team_id=team.id, user_id=user.id)
        self.db.add(new_member)
        self.db.commit()

        return team

    def leave_team(self, user: User) -> None:
        """
        Remove user from their current team.
        If captain leaves, transfer captaincy to the next oldest member.
        If last member leaves, delete the team.

        Args:
            user: User who wants to leave

        Raises:
            HTTPException: If user not in team
        """
        membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User is not in a team"
            )

        team = self.db.query(Team).filter(Team.id == membership.team_id).first()

        if not team:
            # Should not happen if foreign keys are correct, but good for safety
            self.db.delete(membership)
            self.db.commit()
            return

        # If user is captain
        if team.captain_id == user.id:
            # Find other members ordered by joined_at
            other_members = (
                self.db.query(TeamMember)
                .filter(TeamMember.team_id == team.id, TeamMember.user_id != user.id)
                .order_by(TeamMember.joined_at.asc())
                .all()
            )

            if other_members:
                # Transfer captaincy to the oldest member
                new_captain_member = other_members[0]
                team.captain_id = new_captain_member.user_id
                self.db.add(team)
            else:
                # No other members, delete the team
                self.db.delete(team)
                self.db.commit()
                return

        self.db.delete(membership)
        self.db.commit()

    def delete_team(self, user: User) -> None:
        """
        Delete the team. Only captain can do this.

        Args:
            user: User requesting deletion (must be captain)

        Raises:
            HTTPException: If user not in team or not captain
        """
        membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User is not in a team"
            )

        team = self.db.query(Team).filter(Team.id == membership.team_id).first()

        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Team not found"
            )

        if team.captain_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team captain can delete the team",
            )

        self.db.delete(team)
        self.db.commit()

    def transfer_captaincy(self, current_captain: User, new_captain_id: int) -> Team:
        """
        Transfer team captaincy to another member.

        Args:
            current_captain: Current captain (must be verified)
            new_captain_id: ID of new captain

        Returns:
            Updated team

        Raises:
            HTTPException: If not captain or new captain not in team
        """
        # Get current team
        membership = (
            self.db.query(TeamMember)
            .filter(TeamMember.user_id == current_captain.id)
            .first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User is not in a team"
            )

        team = self.db.query(Team).filter(Team.id == membership.team_id).first()

        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Team not found"
            )

        # Verify current user is captain
        if team.captain_id != current_captain.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team captain can transfer captaincy",
            )

        # Verify new captain is in the team
        new_captain_membership = (
            self.db.query(TeamMember)
            .filter(TeamMember.team_id == team.id, TeamMember.user_id == new_captain_id)
            .first()
        )

        if not new_captain_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New captain must be a team member",
            )

        # Transfer captaincy
        team.captain_id = new_captain_id
        self.db.commit()
        self.db.refresh(team)

        return team

    def get_team_by_id(self, team_id: int) -> Optional[Team]:
        """Get team by ID."""
        return self.db.query(Team).filter(Team.id == team_id).first()

    def get_team_by_name(self, team_name: str) -> Optional[Team]:
        """Get team by name."""
        return self.db.query(Team).filter(Team.name == team_name).first()

    def get_all_teams(self, skip: int = 0, limit: int = 100) -> List[Team]:
        """Get all teams with pagination."""
        return self.db.query(Team).offset(skip).limit(limit).all()

    def get_team_members(self, team_id: int) -> List[User]:
        """Get all members of a team."""
        members = (
            self.db.query(User)
            .join(TeamMember)
            .filter(TeamMember.team_id == team_id)
            .all()
        )
        return members

    def get_leaderboard(self, limit: int = 10) -> List[Team]:
        """
        Get team leaderboard sorted by score.

        Args:
            limit: Number of teams to return

        Returns:
            List of top teams
        """
        return (
            self.db.query(Team)
            .order_by(Team.total_score.desc())
            .limit(limit)
            .all()
        )

    def get_user_team(self, user: User) -> Optional[TeamDetailResponse]:
        """
        Get team details for the current user.
        """
        # Find which team the user belongs to
        membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )

        if not membership:
            return None

        team = self.db.query(Team).filter(Team.id == membership.team_id).first()
        if not team:
            return None

        # Get all members
        members = self.db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
        
        # Calculate member scores and build member responses
        member_responses = []
        for member in members:
            # Calculate score for this member
            score = (
                self.db.query(func.sum(Submission.awarded_score))
                .filter(
                    Submission.user_id == member.user_id,
                    Submission.is_correct == True
                )
                .scalar()
            ) or 0
            
            member_user = self.db.query(User).filter(User.id == member.user_id).first()
            
            member_responses.append(
                TeamMemberResponse(
                    user_id=member.user_id,
                    username=member_user.username,
                    email=member_user.email,
                    is_captain=(member.user_id == team.captain_id),
                    joined_at=member.joined_at,
                    score=score
                )
            )

        # Calculate total solved challenges
        solved_count = (
            self.db.query(Submission)
            .filter(
                Submission.team_id == team.id,
                Submission.is_correct == True
            )
            .count()
        )

        # Calculate total team score dynamically
        total_team_score = (
            self.db.query(func.sum(Submission.awarded_score))
            .filter(
                Submission.team_id == team.id,
                Submission.is_correct == True
            )
            .scalar()
        ) or 0

        # Get solved challenges with details
        solved_challenges_query = (
            self.db.query(
                Challenge.id,
                Challenge.title,
                ChallengeCategory.name.label("category_name"),
                Submission.awarded_score,
                Submission.submitted_at
            )
            .join(Submission, Submission.challenge_id == Challenge.id)
            .join(ChallengeCategory, ChallengeCategory.id == Challenge.category_id)
            .filter(
                Submission.team_id == team.id,
                Submission.is_correct == True
            )
            .order_by(Submission.submitted_at.desc())
            .all()
        )

        solved_challenges_data = [
            SolvedChallengeResponse(
                id=row.id,
                title=row.title,
                category_name=row.category_name,
                points=row.awarded_score,
                solved_at=row.submitted_at
            )
            for row in solved_challenges_query
        ]

        return TeamDetailResponse(
            id=team.id,
            name=team.name,
            captain_id=team.captain_id,
            total_score=total_team_score,
            created_at=team.created_at,
            member_count=len(members),
            captain_username=team.captain.username,
            members=member_responses,
            solved_challenges_count=solved_count,
            solved_challenges=solved_challenges_data,
        )
        return self.db.query(Team).order_by(Team.total_score.desc()).limit(limit).all()
