from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class RegistrationCreate(BaseModel):
    """Schema for creating a Registration"""
    event_item_id: UUID


class RegistrationResponse(BaseModel):
    """Schema for Registration response"""
    id: UUID
    event_item_id: UUID
    user_id: UUID
    status: str
    registered_at: datetime
    approved_at: Optional[datetime]
    
    # Optional nested data
    event_item_title: Optional[str] = None
    
    class Config:
        from_attributes = True
