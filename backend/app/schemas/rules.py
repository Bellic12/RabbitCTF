from pydantic import BaseModel, Field
from datetime import datetime

class RuleContent(BaseModel):
    content_md: str
    version_number: int
    updated_at: datetime

    class Config:
        from_attributes = True

class RuleUpdate(BaseModel):
    content_md: str = Field(..., max_length=10000, description="The rules content in Markdown format")
