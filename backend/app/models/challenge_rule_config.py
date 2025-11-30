"""
Challenge rule configuration model.
"""
from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeRuleConfig(Base):
    """
    Challenge rule configuration (attempt limits, case sensitivity).
    """
    __tablename__ = "challenge_rule_config"

    challenge_id = Column(Integer, ForeignKey("challenge.id", ondelete="CASCADE"), primary_key=True)
    attempt_limit = Column(Integer, default=5)
    is_case_sensitive = Column(Boolean, default=True)

    # Relationships
    challenge = relationship("Challenge", back_populates="rule_config")

    def __repr__(self):
        return f"<ChallengeRuleConfig(challenge_id={self.challenge_id}, limit={self.attempt_limit})>"
