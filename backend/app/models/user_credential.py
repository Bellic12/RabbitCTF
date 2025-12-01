"""
User credential model for password management.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserCredential(Base):
    """
    User password and credential management.
    """
    __tablename__ = "user_credential"

    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    password_hash = Column(String(255), nullable=False)
    is_temp_password = Column(Boolean, default=False)
    must_change_password = Column(Boolean, default=False)
    last_changed = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="credential")

    def __repr__(self):
        return f"<UserCredential(user_id={self.user_id}, is_temp={self.is_temp_password})>"
