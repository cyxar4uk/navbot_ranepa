from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class KnowledgeChunkBase(BaseModel):
    """Base schema for KnowledgeChunk"""
    chunk_type: Optional[str] = Field(None, max_length=50)
    content: str
    extra_data: dict[str, Any] = Field(default_factory=dict)  # Additional metadata (renamed from metadata to avoid SQLAlchemy conflict)


class KnowledgeChunkResponse(KnowledgeChunkBase):
    """Schema for KnowledgeChunk response"""
    id: UUID
    event_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KnowledgeChunkRefreshRequest(BaseModel):
    """Request for rebuilding knowledge chunks"""
    event_id: Optional[UUID] = None
