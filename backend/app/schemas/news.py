from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class NewsBase(BaseModel):
    """Base schema for News"""
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    published_at: Optional[datetime] = None


class NewsCreate(NewsBase):
    """Schema for creating News"""
    event_id: UUID


class NewsUpdate(BaseModel):
    """Schema for updating News"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    published_at: Optional[datetime] = None


class NewsResponse(NewsBase):
    """Schema for News response"""
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
