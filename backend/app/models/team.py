"""
Team model for team management.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Team(Base):
    """
    Team model for CTF competition teams.
    """

    __tablename__ = "team"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    captain_id = Column(
        Integer, ForeignKey("user.id"), unique=True, nullable=False, index=True
    )
    total_score = Column(Integer, default=0, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    captain = relationship(
        "User", back_populates="captained_team", foreign_keys=[captain_id]
    )
    credential = relationship(
        "TeamCredential",
        back_populates="team",
        uselist=False,
        cascade="all, delete-orphan",
    )
    members = relationship(
        "TeamMember", back_populates="team", cascade="all, delete-orphan"
    )
    submissions = relationship("Submission", back_populates="team")

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}', score={self.total_score})>"
