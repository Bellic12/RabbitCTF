from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventConfigBase(BaseModel):
    event_name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    event_timezone: Optional[str] = "UTC"

class EventConfigUpdate(EventConfigBase):
    pass

class EventConfigResponse(EventConfigBase):
    id: int
    
    class Config:
        from_attributes = True
