"""
Event rule current version model.
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class EventRuleCurrent(Base):
    """
    Current active event rule version.
    """
    __tablename__ = "event_rule_current"

    id = Column(Integer, primary_key=True, default=1)
    active_version_id = Column(Integer, ForeignKey("event_rule_version.id"), unique=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    active_version = relationship("EventRuleVersion", back_populates="current_rule")

    def __repr__(self):
        return f"<EventRuleCurrent(id={self.id}, active_version_id={self.active_version_id})>"
