from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GroupBase(BaseModel):
    name: str
    code: str
    department: str
    description: Optional[str] = None
    curator: Optional[str] = None
    year: int
    is_active: bool = True


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    curator: Optional[str] = None
    year: Optional[int] = None
    is_active: Optional[bool] = None


class GroupResponse(GroupBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

