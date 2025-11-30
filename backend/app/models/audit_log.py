"""
Audit log model for system activity tracking.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditLog(Base):
    """
    System audit log for tracking user actions.
    """
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), index=True)
    action = Column(String(50), nullable=False, index=True)
    resource_type = Column(String(30), index=True)
    resource_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    # Composite index
    __table_args__ = (
        Index('idx_audit_log_resource', 'resource_type', 'resource_id'),
    )

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', user_id={self.user_id})>"
