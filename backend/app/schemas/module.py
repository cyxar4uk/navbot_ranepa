from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Any


class ModuleBase(BaseModel):
    """Base schema for Module"""
    type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    icon: Optional[str] = Field(None, max_length=10)
    enabled: bool = True
    order: int = 0
    badge_type: str = Field(default="none", pattern="^(none|count|dot)$")
    badge_value: Optional[str] = Field(None, max_length=50)
    config: dict[str, Any] = Field(default_factory=dict)


class ModuleCreate(ModuleBase):
    """Schema for creating a Module"""
    event_id: UUID


class ModuleUpdate(BaseModel):
    """Schema for updating a Module"""
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    icon: Optional[str] = Field(None, max_length=10)
    enabled: Optional[bool] = None
    order: Optional[int] = None
    badge_type: Optional[str] = Field(None, pattern="^(none|count|dot)$")
    badge_value: Optional[str] = Field(None, max_length=50)
    config: Optional[dict[str, Any]] = None


class ModuleResponse(ModuleBase):
    """Schema for Module response"""
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ModuleReorder(BaseModel):
    """Schema for reordering modules"""
    module_ids: list[UUID]
