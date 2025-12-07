"""
Challenge file model for file attachments.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChallengeFile(Base):
    """
    Challenge file attachments.
    """

    __tablename__ = "challenge_file"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(
        Integer,
        ForeignKey("challenge.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_path = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(20))
    file_size_mb = Column(Float)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    challenge = relationship("Challenge", back_populates="files")

    def __repr__(self):
        return f"<ChallengeFile(id={self.id}, name='{self.file_name}', challenge_id={self.challenge_id})>"
