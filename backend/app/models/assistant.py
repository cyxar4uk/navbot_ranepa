from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class AssistantKnowledge(Base):
    """AssistantKnowledge model - база знаний для AI-ассистента"""
    __tablename__ = "assistant_knowledge"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=True)  # NULL = global knowledge
    
    content_type = Column(String(50), nullable=True)  # faq, info, navigation, etc.
    content = Column(Text, nullable=False)
    
    extra_data = Column(JSONB, default={})  # Additional metadata for filtering (renamed from metadata to avoid SQLAlchemy conflict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="assistant_knowledge")
    
    def __repr__(self):
        return f"<AssistantKnowledge(id={self.id}, content_type={self.content_type})>"
