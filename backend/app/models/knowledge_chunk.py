from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class KnowledgeChunk(Base):
    """KnowledgeChunk model - нормализованные факты для ассистента"""
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=True)

    chunk_type = Column(String(50), nullable=True)
    content = Column(Text, nullable=False)
    metadata = Column(JSONB, default={})
    extra_data = Column(JSONB, default={})  # Additional metadata (renamed from metadata to avoid SQLAlchemy conflict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    event = relationship("Event", back_populates="knowledge_chunks")

    def __repr__(self) -> str:
        return f"<KnowledgeChunk(id={self.id}, event_id={self.event_id}, type={self.chunk_type})>"
