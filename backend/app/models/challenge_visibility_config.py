"""
Challenge visibility configuration model.
"""
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeVisibilityConfig(Base):
    """
    Challenge visibility and time-based access control.
    """
    __tablename__ = "challenge_visibility_config"

    challenge_id = Column(Integer, ForeignKey("challenge.id", ondelete="CASCADE"), primary_key=True)
    is_visible = Column(Boolean, default=False)
    visible_from = Column(DateTime(timezone=True))
    visible_until = Column(DateTime(timezone=True))

    # Relationships
    challenge = relationship("Challenge", back_populates="visibility_config")

    def __repr__(self):
        return f"<ChallengeVisibilityConfig(challenge_id={self.challenge_id}, visible={self.is_visible})>"
