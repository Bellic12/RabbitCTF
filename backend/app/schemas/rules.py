from pydantic import BaseModel
from datetime import datetime

class RuleContent(BaseModel):
    content_md: str
    version_number: int
    updated_at: datetime

    class Config:
        from_attributes = True
