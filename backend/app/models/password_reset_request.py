"""
Password reset request model.
"""
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class PasswordResetRequest(Base):
    """
    Password reset request tracking.
    """
    __tablename__ = "password_reset_request"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    is_processed = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="password_reset_requests")

    def __repr__(self):
        return f"<PasswordResetRequest(id={self.id}, user_id={self.user_id}, processed={self.is_processed})>"
