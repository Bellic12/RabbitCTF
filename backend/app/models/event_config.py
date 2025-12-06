"""
Event configuration model.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class EventConfig(Base):
    """
    CTF event configuration and settings.
    """

    __tablename__ = "event_config"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False)
    start_time = Column(DateTime(timezone=True), index=True)
    end_time = Column(DateTime(timezone=True), index=True)
    status = Column(String(20), default="not_started", index=True)
    max_team_size = Column(Integer, default=4)
    max_submission_attempts = Column(Integer, default=5)
    submission_time_window_seconds = Column(Integer, default=60)
    submission_block_minutes = Column(Integer, default=5)
    max_file_size_mb = Column(Float, default=100)
    max_challenge_files_mb = Column(Float, default=500)
    allowed_file_types = Column(
        JSON, default=["zip", "tar.gz", "txt", "pdf", "pcap", "png", "jpg"]
    )
    discord_webhook_url = Column(String(255))
    discord_bot_token_encrypted = Column(String(255))
    discord_notifications_enabled = Column(Boolean, default=False)
    allow_solution_history = Column(Boolean, default=False)
    event_timezone = Column(String(50), default="UTC")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<EventConfig(id={self.id}, name='{self.event_name}', status='{self.status}')>"
