"""
Team service for business logic.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_credential import TeamCredential
from app.models.user import User
from app.schemas.teams import TeamCreate, TeamJoin
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
        max_team_size = 4  # Default from event_config

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

        Args:
            user: User who wants to leave

        Raises:
            HTTPException: If user not in team or is captain
        """
        membership = (
            self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User is not in a team"
            )

        team = self.db.query(Team).filter(Team.id == membership.team_id).first()

        # Captain cannot leave (must transfer captaincy first)
        if team and team.captain_id == user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Captain must transfer captaincy before leaving",
            )

        self.db.delete(membership)
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
        return self.db.query(Team).order_by(Team.total_score.desc()).limit(limit).all()
