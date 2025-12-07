from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.event_rule_current import EventRuleCurrent
from app.schemas.rules import RuleContent

router = APIRouter()

@router.get("/", response_model=RuleContent)
def get_current_rules(db: Session = Depends(get_db)):
    """
    Get the current active competition rules.
    """
    current_rule = db.query(EventRuleCurrent).first()
    
    if not current_rule or not current_rule.active_version:
        raise HTTPException(status_code=404, detail="Rules not found")
        
    return RuleContent(
        content_md=current_rule.active_version.content_md,
        version_number=current_rule.active_version.version_number,
        updated_at=current_rule.updated_at or current_rule.active_version.created_at
    )
