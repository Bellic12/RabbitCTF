"""
Submission model for flag submissions.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Submission(Base):
    """
    Flag submission tracking and scoring.
    """
    __tablename__ = "submission"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("team.id"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("challenge.id"), nullable=False, index=True)
    submitted_flag_hash = Column(String(255), nullable=False)
    is_correct = Column(Boolean, default=False, index=True)
    awarded_score = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="submissions")
    team = relationship("Team", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")

    # Composite indexes defined in table args
    __table_args__ = (
        Index('idx_submission_team_correct', 'team_id', 'is_correct'),
        Index('idx_submission_user_challenge_time', 'user_id', 'challenge_id', 'submitted_at'),
        Index('idx_submission_challenge_correct', 'challenge_id', 'is_correct'),
        # Unique constraint: one team can only solve a challenge once
        Index(
            'idx_submission_team_challenge_unique',
            'team_id',
            'challenge_id',
            unique=True,
            postgresql_where=(Column('is_correct') == True)
        ),
    )

    def __repr__(self):
        return f"<Submission(id={self.id}, user_id={self.user_id}, correct={self.is_correct})>"
