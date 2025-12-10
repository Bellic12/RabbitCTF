"""
Team schemas for RabbitCTF.
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime


# =============================================
# TEAM SCHEMAS
# =============================================


class TeamBase(BaseModel):
    """Base team schema with common fields."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Team name (2-50 characters)",
        examples=["Hackers United", "CyberNinjas", "Team Alpha"],
    )


class TeamCreate(TeamBase):
    """Schema for team creation."""

    password: str = Field(
        ...,
        min_length=4,
        max_length=128,
        description="Team password for members to join (minimum 4 characters)",
        examples=["TeamPass123"],
    )
    password_confirm: str = Field(
        ..., description="Password confirmation", examples=["TeamPass123"]
    )

    @field_validator("password_confirm")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        """Validate that passwords match."""
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("name")
    @classmethod
    def validate_team_name(cls, v: str) -> str:
        """Validate team name format."""
        if v.lower() in ["admin", "system", "captain", "staff"]:
            raise ValueError("This team name is reserved")
        # Check for inappropriate characters
        if any(char in v for char in ["<", ">", '"', "'"]):
            raise ValueError("Team name contains invalid characters")
        return v


class TeamJoin(BaseModel):
    """Schema for joining a team."""

    team_name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Name of the team to join",
        examples=["Hackers United"],
    )
    password: str = Field(
        ..., min_length=1, description="Team password", examples=["TeamPass123"]
    )


class TeamResponse(TeamBase):
    """Schema for team response (basic info)."""

    id: int
    captain_id: int
    total_score: int = 0
    created_at: datetime
    member_count: Optional[int] = Field(default=0, description="Number of team members")

    model_config = ConfigDict(from_attributes=True)


class TeamMemberResponse(BaseModel):
    """Schema for team member information."""

    user_id: int
    username: str
    email: str
    is_captain: bool = False
    joined_at: datetime
    score: int = 0

    model_config = ConfigDict(from_attributes=True)


class SolvedChallengeResponse(BaseModel):
    """Schema for solved challenge information."""

    id: int
    title: str
    category_name: str
    points: int
    solved_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamDetailResponse(TeamResponse):
    """Schema for detailed team response including members."""

    captain_username: Optional[str] = None
    members: List[TeamMemberResponse] = Field(
        default_factory=list, description="List of team members"
    )
    solved_challenges: List[SolvedChallengeResponse] = Field(
        default_factory=list, description="List of solved challenges"
    )
    recent_solves: Optional[int] = Field(
        default=0, description="Number of challenges solved recently"
    )
    solved_challenges_count: int = Field(
        default=0, description="Total number of challenges solved by the team"
    )
    rank: Optional[int] = Field(
        default=None, description="Team's current rank in the competition"
    )

    model_config = ConfigDict(from_attributes=True)


class TeamUpdate(BaseModel):
    """Schema for updating team information."""

    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50,
        description="New team name",
        examples=["Updated Team Name"],
    )
    new_password: Optional[str] = Field(
        None,
        min_length=4,
        max_length=128,
        description="New team password",
        examples=["NewTeamPass456"],
    )
    new_password_confirm: Optional[str] = Field(
        None, description="New password confirmation", examples=["NewTeamPass456"]
    )

    @field_validator("new_password_confirm")
    @classmethod
    def passwords_match(cls, v: Optional[str], info) -> Optional[str]:
        """Validate that passwords match if provided."""
        if v is not None and "new_password" in info.data:
            if v != info.data["new_password"]:
                raise ValueError("Passwords do not match")
        return v


class TeamLeaveRequest(BaseModel):
    """Schema for leaving a team."""

    confirm: bool = Field(
        ..., description="Confirmation to leave the team", examples=[True]
    )

    @field_validator("confirm")
    @classmethod
    def must_be_true(cls, v: bool) -> bool:
        """Ensure confirmation is true."""
        if not v:
            raise ValueError("You must confirm to leave the team")
        return v


class TeamKickMember(BaseModel):
    """Schema for kicking a member from team (captain only)."""

    user_id: int = Field(..., gt=0, description="ID of the user to kick", examples=[5])
    reason: Optional[str] = Field(
        None,
        max_length=200,
        description="Optional reason for kicking the member",
        examples=["Inactive player"],
    )


class TeamTransferCaptain(BaseModel):
    """Schema for transferring team captain role."""

    new_captain_id: int = Field(
        ...,
        gt=0,
        description="ID of the new team captain (must be a team member)",
        examples=[7],
    )
    confirm: bool = Field(
        ..., description="Confirmation to transfer captain role", examples=[True]
    )

    @field_validator("confirm")
    @classmethod
    def must_be_true(cls, v: bool) -> bool:
        """Ensure confirmation is true."""
        if not v:
            raise ValueError("You must confirm to transfer captain role")
        return v


# =============================================
# LEADERBOARD SCHEMAS
# =============================================


class TeamLeaderboardEntry(BaseModel):
    """Schema for team entry in leaderboard."""

    rank: int
    team_id: int
    team_name: str
    total_score: int
    member_count: int
    solved_challenges: int
    last_solve_time: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TeamStatsResponse(BaseModel):
    """Schema for team statistics."""

    team_id: int
    team_name: str
    total_score: int
    challenges_solved: int
    challenges_attempted: int
    success_rate: float = Field(
        ..., ge=0.0, le=100.0, description="Percentage of successful submissions"
    )
    avg_solve_time: Optional[float] = Field(
        None, description="Average time to solve a challenge (in minutes)"
    )
    category_breakdown: dict = Field(
        default_factory=dict, description="Solved challenges by category"
    )

    model_config = ConfigDict(from_attributes=True)
