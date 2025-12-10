"""
User model for authentication and user management.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """
    User model for competitors and administrators.
    """

    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("role.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    role = relationship("Role", back_populates="users")
    credential = relationship(
        "UserCredential",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    password_reset_requests = relationship(
        "PasswordResetRequest", back_populates="user", cascade="all, delete-orphan"
    )
    team_membership = relationship(
        "TeamMember", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    captained_team = relationship(
        "Team",
        back_populates="captain",
        foreign_keys="Team.captain_id",
        cascade="all, delete-orphan",
    )
    created_challenges = relationship("Challenge", back_populates="creator")
    submissions = relationship(
        "Submission", back_populates="user", cascade="all, delete-orphan"
    )
    submission_blocks = relationship("SubmissionBlock", back_populates="user")
    created_event_rules = relationship("EventRuleVersion", back_populates="creator")
    created_notifications = relationship("Notification", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
