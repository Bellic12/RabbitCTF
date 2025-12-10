"""
Public event endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.event_config import EventConfig
from app.schemas.event import EventConfigResponse
from app.core.enum import EventStatus

router = APIRouter()

@router.get("/status", response_model=EventConfigResponse)
async def get_event_status(db: Session = Depends(get_db)):
    """
    Get public event status and timing.
    """
    config = db.query(EventConfig).first()
    if not config:
        # Return default if not configured
        return EventConfigResponse(
            id=0,
            event_name="RabbitCTF",
            status=EventStatus.NOT_STARTED,
            start_time=None,
            end_time=None,
            event_timezone="UTC"
        )
    
    # Auto-update status logic (same as admin)
    now = datetime.now(timezone.utc)
    changed = False
    
    if config.start_time and config.end_time:
        # Ensure datetimes are timezone-aware
        start_time = config.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
            
        end_time = config.end_time
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)

        if config.status == EventStatus.NOT_STARTED and now >= start_time:
            if now < end_time:
                config.status = EventStatus.ACTIVE
                changed = True
            elif now >= end_time:
                config.status = EventStatus.FINISHED
                changed = True
        elif config.status == EventStatus.ACTIVE and now >= end_time:
            config.status = EventStatus.FINISHED
            changed = True
            
    if changed:
        db.commit()
        db.refresh(config)
        
    return config
