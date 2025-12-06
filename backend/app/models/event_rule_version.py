"""
Event rule version model.
"""

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class EventRuleVersion(Base):
    """
    Event rules version history.
    """

    __tablename__ = "event_rule_version"

    id = Column(Integer, primary_key=True, index=True)
    content_md = Column(Text, nullable=False)
    version_number = Column(Integer, nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    creator = relationship("User", back_populates="created_event_rules")
    current_rule = relationship(
        "EventRuleCurrent", back_populates="active_version", uselist=False
    )

    def __repr__(self):
        return f"<EventRuleVersion(id={self.id}, version={self.version_number})>"
