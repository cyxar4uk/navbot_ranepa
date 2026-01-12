from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class MessageCreate(BaseModel):
    """Schema for creating a Message"""
    event_id: UUID
    to_user_id: Optional[UUID] = None
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    """Schema for Message response"""
    id: UUID
    event_id: UUID
    from_user_id: UUID
    to_user_id: Optional[UUID]
    content: str
    read_at: Optional[datetime]
    created_at: datetime
    
    # Optional nested data
    from_user_name: Optional[str] = None
    to_user_name: Optional[str] = None
    
    class Config:
        from_attributes = True
