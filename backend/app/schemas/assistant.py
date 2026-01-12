from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Any, Literal


class AssistantChatRequest(BaseModel):
    """Schema for assistant chat request"""
    event_id: UUID
    message: str = Field(..., min_length=1, max_length=2000)
    context: Optional[dict[str, Any]] = Field(default_factory=dict)
    # Context can include: module_id, item_id for more specific answers


class AssistantAction(BaseModel):
    """Schema for assistant actions"""
    type: Literal["open_map"]
    label: Optional[str] = None
    location_id: UUID


class AssistantChatResponse(BaseModel):
    """Schema for assistant chat response"""
    response: str
    sources: list[str] = Field(default_factory=list)
    actions: list[AssistantAction] = Field(default_factory=list)


class AssistantKnowledgeBase(BaseModel):
    """Base schema for AssistantKnowledge"""
    content_type: Optional[str] = Field(None, max_length=50)
    content: str
    extra_data: dict[str, Any] = Field(default_factory=dict)


class AssistantKnowledgeCreate(AssistantKnowledgeBase):
    """Schema for creating AssistantKnowledge"""
    event_id: Optional[UUID] = None  # NULL for global knowledge


class AssistantKnowledgeResponse(AssistantKnowledgeBase):
    """Schema for AssistantKnowledge response"""
    id: UUID
    event_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
