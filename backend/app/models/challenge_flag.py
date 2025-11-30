"""
Challenge flag model.
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeFlag(Base):
    """
    Challenge flag storage (hashed).
    """
    __tablename__ = "challenge_flag"

    challenge_id = Column(Integer, ForeignKey("challenge.id", ondelete="CASCADE"), primary_key=True)
    flag_hash = Column(String(255), nullable=False)

    # Relationships
    challenge = relationship("Challenge", back_populates="flag")

    def __repr__(self):
        return f"<ChallengeFlag(challenge_id={self.challenge_id})>"
