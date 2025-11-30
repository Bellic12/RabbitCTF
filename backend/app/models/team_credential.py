"""
Team credential model for team password management.
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TeamCredential(Base):
    """
    Team password and credential management.
    """
    __tablename__ = "team_credential"

    team_id = Column(Integer, ForeignKey("team.id", ondelete="CASCADE"), primary_key=True)
    password_hash = Column(String(255), nullable=False)

    # Relationships
    team = relationship("Team", back_populates="credential")

    def __repr__(self):
        return f"<TeamCredential(team_id={self.team_id})>"
