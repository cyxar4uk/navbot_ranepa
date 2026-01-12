from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Any


class ZoneBase(BaseModel):
    """Base schema for Zone"""
    name: str = Field(..., min_length=1, max_length=255)
    floor: Optional[int] = None
    coordinates: dict[str, Any] = Field(default_factory=dict)
    map_data: dict[str, Any] = Field(default_factory=dict)


class ZoneCreate(ZoneBase):
    """Schema for creating a Zone"""
    event_id: UUID


class ZoneResponse(ZoneBase):
    """Schema for Zone response"""
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LocationBase(BaseModel):
    """Base schema for Location"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    floor: Optional[int] = None
    zone_id: Optional[UUID] = None
    coordinates: dict[str, Any] = Field(default_factory=dict)


class LocationCreate(LocationBase):
    """Schema for creating a Location"""
    event_id: UUID


class LocationUpdate(BaseModel):
    """Schema for updating a Location"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    floor: Optional[int] = None
    zone_id: Optional[UUID] = None
    coordinates: Optional[dict[str, Any]] = None


class LocationResponse(LocationBase):
    """Schema for Location response"""
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Optional nested data
    zone_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class MapDataResponse(BaseModel):
    """Schema for map data response"""
    zones: list[ZoneResponse]
    locations: list[LocationResponse]
