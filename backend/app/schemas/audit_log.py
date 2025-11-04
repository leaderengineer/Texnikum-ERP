from pydantic import BaseModel, Field
from datetime import datetime
from app.models.audit_log import ActionType


class AuditLogBase(BaseModel):
    action: ActionType
    resource_type: str
    resource_id: int | None = None
    description: str | None = None


class AuditLogCreate(AuditLogBase):
    user_id: int | None = None
    user_email: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    user_email: str | None
    action: ActionType
    resource_type: str
    resource_id: int | None
    description: str | None
    ip_address: str | None
    user_agent: str | None
    created_at: datetime

    class Config:
        from_attributes = True

