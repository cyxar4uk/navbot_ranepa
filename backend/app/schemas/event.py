from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class EventBase(BaseModel):
    """Base schema for Event"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date_start: datetime
    date_end: datetime
    location: Optional[str] = Field(None, max_length=255)
    status: str = Field(default="upcoming", pattern="^(upcoming|active|finished)$")


class EventCreate(EventBase):
    """Schema for creating an Event"""
    pass


class EventUpdate(BaseModel):
    """Schema for updating an Event"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = Field(None, pattern="^(upcoming|active|finished)$")


class EventResponse(EventBase):
    """Schema for Event response"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    """Schema for list of events response"""
    items: list[EventResponse]
    total: int
