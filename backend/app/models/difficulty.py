"""
Difficulty model for challenge difficulty levels.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Difficulty(Base):
    """
    Challenge difficulty level model (Easy, Medium, Hard, Insane).
    """
    __tablename__ = "difficulty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), unique=True, nullable=False, index=True)
    sort_order = Column(Integer, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    challenges = relationship("Challenge", back_populates="difficulty")

    def __repr__(self):
        return f"<Difficulty(id={self.id}, name='{self.name}', order={self.sort_order})>"
