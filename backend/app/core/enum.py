"""
Enumerations for RabbitCTF domain.
"""

from enum import Enum


class UserRole(str, Enum):
    """User roles in the system."""

    ADMIN = "admin"
    CAPTAIN = "captain"
    PARTICIPANT = "user"  # En tu DB se llama "user"


class DifficultyLevel(str, Enum):
    """Challenge difficulty levels."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    INSANE = "insane"  # Extra level in your DB


class EventStatus(str, Enum):
    """Event lifecycle status."""

    NOT_STARTED = "not_started"
    ACTIVE = "active"
    FINISHED = "finished"
    PAUSED = "paused"


class NotificationType(str, Enum):
    """Types of notifications."""

    CHALLENGE_PUBLISHED = "challenge_published"
    ANNOUNCEMENT = "announcement"
    FIRST_BLOOD = "first_blood"
    ACHIEVEMENT = "achievement"
    SYSTEM = "system"


class ScoringType(str, Enum):
    """Scoring strategies."""

    STATIC = "static"
    DYNAMIC = "dynamic"


class SubmissionStatus(str, Enum):
    """Submission validation status."""

    CORRECT = "correct"
    INCORRECT = "incorrect"
    RATE_LIMITED = "rate_limited"
    BLOCKED = "blocked"
