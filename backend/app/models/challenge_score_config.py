"""
Challenge score configuration model.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeScoreConfig(Base):
    """
    Challenge scoring configuration (static or dynamic).
    """

    __tablename__ = "challenge_score_config"

    challenge_id = Column(
        Integer, ForeignKey("challenge.id", ondelete="CASCADE"), primary_key=True
    )
    scoring_mode = Column(String(20), default="STATIC", nullable=False)
    base_score = Column(Integer, nullable=False)
    decay_factor = Column(Float)
    min_score = Column(Integer)

    # Relationships
    challenge = relationship("Challenge", back_populates="score_config")

    def __repr__(self):
        return f"<ChallengeScoreConfig(challenge_id={self.challenge_id}, mode='{self.scoring_mode}', base={self.base_score})>"
