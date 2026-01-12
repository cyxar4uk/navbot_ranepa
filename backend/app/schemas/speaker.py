from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Any


class SpeakerBase(BaseModel):
    """Base schema for Speaker"""
    name: str = Field(..., min_length=1, max_length=255)
    bio: Optional[str] = None
    photo_url: Optional[str] = Field(None, max_length=500)
    position: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    social_links: dict[str, Any] = Field(default_factory=dict)


class SpeakerCreate(SpeakerBase):
    """Schema for creating a Speaker"""
    event_id: UUID


class SpeakerUpdate(BaseModel):
    """Schema for updating a Speaker"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    bio: Optional[str] = None
    photo_url: Optional[str] = Field(None, max_length=500)
    position: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    social_links: Optional[dict[str, Any]] = None


class SpeakerResponse(SpeakerBase):
    """Schema for Speaker response"""
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
