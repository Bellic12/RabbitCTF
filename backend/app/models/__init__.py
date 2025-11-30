"""
SQLAlchemy models for RabbitCTF platform.

This module exports all database models for use throughout the application.
Models are organized by domain:
- Reference Data: Role, Difficulty
- User Management: User, UserCredential, PasswordResetRequest
- Team Management: Team, TeamCredential, TeamMember
- Challenge Management: Challenge, ChallengeCategory, ChallengeScoreConfig, etc.
- Event Management: EventConfig, EventRuleVersion, EventRuleCurrent
- System: Notification, AuditLog
"""

# Import Base for use in other modules
from app.core.database import Base

# Reference Data
from app.models.role import Role
from app.models.difficulty import Difficulty

# User Management
from app.models.user import User
from app.models.user_credential import UserCredential
from app.models.password_reset_request import PasswordResetRequest

# Team Management
from app.models.team import Team
from app.models.team_credential import TeamCredential
from app.models.team_member import TeamMember

# Challenge Management
from app.models.challenge_category import ChallengeCategory
from app.models.challenge import Challenge
from app.models.challenge_score_config import ChallengeScoreConfig
from app.models.challenge_rule_config import ChallengeRuleConfig
from app.models.challenge_flag import ChallengeFlag
from app.models.challenge_visibility_config import ChallengeVisibilityConfig
from app.models.challenge_file import ChallengeFile

# Submission & Participation
from app.models.submission import Submission
from app.models.submission_block import SubmissionBlock

# Event Configuration
from app.models.event_config import EventConfig
from app.models.event_rule_version import EventRuleVersion
from app.models.event_rule_current import EventRuleCurrent

# System
from app.models.notification import Notification
from app.models.audit_log import AuditLog

# Export all models
__all__ = [
    # Base
    "Base",
    # Reference Data
    "Role",
    "Difficulty",
    # User Management
    "User",
    "UserCredential",
    "PasswordResetRequest",
    # Team Management
    "Team",
    "TeamCredential",
    "TeamMember",
    # Challenge Management
    "ChallengeCategory",
    "Challenge",
    "ChallengeScoreConfig",
    "ChallengeRuleConfig",
    "ChallengeFlag",
    "ChallengeVisibilityConfig",
    "ChallengeFile",
    # Submission & Participation
    "Submission",
    "SubmissionBlock",
    # Event Configuration
    "EventConfig",
    "EventRuleVersion",
    "EventRuleCurrent",
    # System
    "Notification",
    "AuditLog",
]
