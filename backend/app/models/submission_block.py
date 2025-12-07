"""
Submission block model for rate limiting.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class SubmissionBlock(Base):
    """
    Submission blocking for rate limiting and anti-brute force.
    """

    __tablename__ = "submission_block"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("challenge.id"), index=True)
    blocked_until = Column(DateTime(timezone=True), nullable=False, index=True)
    reason = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="submission_blocks")
    challenge = relationship("Challenge", back_populates="submission_blocks")

    def __repr__(self):
        return f"<SubmissionBlock(id={self.id}, user_id={self.user_id}, until={self.blocked_until})>"
