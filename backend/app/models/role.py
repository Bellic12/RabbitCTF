"""
Role model for user role management.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Role(Base):
    """
    User role model (admin, moderator, user).
    """
    __tablename__ = "role"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), unique=True, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"
