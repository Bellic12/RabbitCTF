from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class EventConfigBase(BaseModel):
    event_name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    event_timezone: Optional[str] = "UTC"
    max_team_size: Optional[int] = 4
    max_submission_attempts: Optional[int] = 5
    submission_time_window_seconds: Optional[int] = 60
    submission_block_minutes: Optional[int] = 5
    max_file_size_mb: Optional[float] = 100.0
    max_challenge_files_mb: Optional[float] = 500.0
    allowed_file_types: Optional[List[str]] = ["zip", "tar.gz", "txt", "pdf", "pcap", "png", "jpg"]
    discord_webhook_url: Optional[str] = None
    discord_notifications_enabled: Optional[bool] = False
    allow_solution_history: Optional[bool] = False

class EventConfigUpdate(EventConfigBase):
    pass

class EventConfigResponse(EventConfigBase):
    id: int
    
    class Config:
        from_attributes = True
