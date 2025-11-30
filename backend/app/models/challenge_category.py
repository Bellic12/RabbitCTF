"""
Challenge category model.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeCategory(Base):
    """
    Challenge category model (Web, Crypto, Reverse, etc.).
    """
    __tablename__ = "challenge_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    challenges = relationship("Challenge", back_populates="category")

    def __repr__(self):
        return f"<ChallengeCategory(id={self.id}, name='{self.name}', active={self.is_active})>"
