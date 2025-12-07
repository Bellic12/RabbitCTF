"""
Team member model for team membership.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class TeamMember(Base):
    """
    Team membership tracking.
    """

    __tablename__ = "team_member"

    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    team_id = Column(
        Integer, ForeignKey("team.id", ondelete="CASCADE"), nullable=False, index=True
    )
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="team_membership")
    team = relationship("Team", back_populates="members")

    def __repr__(self):
        return f"<TeamMember(user_id={self.user_id}, team_id={self.team_id})>"
