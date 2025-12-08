from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.core.database import get_db
from app.models.event_rule_current import EventRuleCurrent
from app.models.event_rule_version import EventRuleVersion
from app.models.user import User
from app.schemas.rules import RuleContent, RuleUpdate
from app.api.deps import get_current_admin

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


@router.post("/", response_model=RuleContent)
def update_rules(
    rule_in: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Update competition rules.
    Creates a new version of the rules.
    """
    current_rule = db.query(EventRuleCurrent).first()
    next_version = 1
    
    if current_rule and current_rule.active_version:
        next_version = current_rule.active_version.version_number + 1
    
    new_version = EventRuleVersion(
        content_md=rule_in.content_md,
        version_number=next_version,
        created_by=current_user.id
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    
    if not current_rule:
        current_rule = EventRuleCurrent(active_version_id=new_version.id)
        db.add(current_rule)
    else:
        current_rule.active_version_id = new_version.id
        current_rule.updated_at = func.now()
        
    db.commit()
    
    return RuleContent(
        content_md=new_version.content_md,
        version_number=new_version.version_number,
        updated_at=new_version.created_at
    )
