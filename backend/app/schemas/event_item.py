from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID
from typing import Optional, Any


class EventItemBase(BaseModel):
    """Base schema for EventItem"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    location_id: Optional[UUID] = None
    capacity: Optional[int] = Field(None, ge=0)
    type: Optional[str] = Field(None, max_length=50)
    status: str = Field(default="active", pattern="^(active|cancelled|finished)$")
    extra_data: dict[str, Any] = Field(default_factory=dict)


class EventItemCreate(EventItemBase):
    """Schema for creating an EventItem"""
    event_id: UUID
    module_id: Optional[UUID] = None
    speaker_ids: Optional[list[UUID]] = None


class EventItemUpdate(BaseModel):
    """Schema for updating an EventItem"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    location_id: Optional[UUID] = None
    capacity: Optional[int] = Field(None, ge=0)
    type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, pattern="^(active|cancelled|finished)$")
    metadata: Optional[dict[str, Any]] = None
    speaker_ids: Optional[list[UUID]] = None


class EventItemResponse(EventItemBase):
    """Schema for EventItem response"""
    id: UUID
    event_id: UUID
    module_id: Optional[UUID]
    registered_count: int
    available_spots: Optional[int] = None
    is_full: bool = False
    created_at: datetime
    updated_at: datetime
    
    # Optional nested data
    location_name: Optional[str] = None
    speakers: list[dict] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class EventItemFilter(BaseModel):
    """Schema for filtering EventItems"""
    day: Optional[date] = None
    type: Optional[str] = None
    location_id: Optional[UUID] = None
    search: Optional[str] = None
    available_only: bool = False
