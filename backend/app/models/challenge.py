"""
Challenge model for CTF challenges.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Challenge(Base):
    """
    CTF challenge model.
    """
    __tablename__ = "challenge"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("challenge_category.id"), index=True)
    difficulty_id = Column(Integer, ForeignKey("difficulty.id"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("user.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    operational_data = Column(Text)
    is_draft = Column(Boolean, default=True, index=True)

    # Relationships
    category = relationship("ChallengeCategory", back_populates="challenges")
    difficulty = relationship("Difficulty", back_populates="challenges")
    creator = relationship("User", back_populates="created_challenges")
    score_config = relationship("ChallengeScoreConfig", back_populates="challenge", uselist=False, cascade="all, delete-orphan")
    rule_config = relationship("ChallengeRuleConfig", back_populates="challenge", uselist=False, cascade="all, delete-orphan")
    flag = relationship("ChallengeFlag", back_populates="challenge", uselist=False, cascade="all, delete-orphan")
    visibility_config = relationship("ChallengeVisibilityConfig", back_populates="challenge", uselist=False, cascade="all, delete-orphan")
    files = relationship("ChallengeFile", back_populates="challenge", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="challenge")
    submission_blocks = relationship("SubmissionBlock", back_populates="challenge")

    def __repr__(self):
        return f"<Challenge(id={self.id}, title='{self.title}', draft={self.is_draft})>"
