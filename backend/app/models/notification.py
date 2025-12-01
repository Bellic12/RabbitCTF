"""
Notification model for system announcements.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Notification(Base):
    """
    System notifications and announcements.
    """
    __tablename__ = "notification"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), nullable=False, index=True)
    is_published = Column(Boolean, default=True, index=True)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    published_at = Column(DateTime(timezone=True))

    # Relationships
    creator = relationship("User", back_populates="created_notifications")

    # Composite indexes
    __table_args__ = (
        Index('idx_notification_published_created', 'is_published', 'created_at'),
    )

    def __repr__(self):
        return f"<Notification(id={self.id}, title='{self.title}', type='{self.type}')>"
