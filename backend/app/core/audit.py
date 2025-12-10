"""
Audit logging utilities for tracking system actions.
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.audit_log import AuditLog


def log_audit(
    db: Session,
    user_id: int,
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """
    Create an audit log entry.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        action: Type of action (CREATE, UPDATE, DELETE, LOGIN, SUBMIT, etc.)
        resource_type: Type of resource being acted upon (challenge, team, user, etc.)
        resource_id: ID of the specific resource
        details: Additional details as JSON
        ip_address: IP address of the user
        request: FastAPI request object (will extract IP if ip_address not provided)
    
    Returns:
        AuditLog: Created audit log entry
    """
    # Extract IP from request if not provided
    if ip_address is None and request is not None:
        ip_address = get_client_ip(request)
    
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address or "unknown"
    )
    
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    
    return audit_entry


def get_client_ip(request: Request) -> str:
    """
    Extract client IP address from request.
    Handles proxies and forwarded headers.
    
    Args:
        request: FastAPI request object
    
    Returns:
        str: Client IP address
    """
    # Check for proxy headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, get the first one
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct client address
    if request.client:
        return request.client.host
    
    return "unknown"
