from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Event(Base):
    """Event model - центральная сущность приложения"""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date_start = Column(DateTime(timezone=True), nullable=False)
    date_end = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(255), nullable=True)
    status = Column(String(20), default="upcoming")  # upcoming, active, finished
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    modules = relationship("Module", back_populates="event", cascade="all, delete-orphan")
    event_items = relationship("EventItem", back_populates="event", cascade="all, delete-orphan")
    speakers = relationship("Speaker", back_populates="event", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="event", cascade="all, delete-orphan")
    zones = relationship("Zone", back_populates="event", cascade="all, delete-orphan")
    assistant_knowledge = relationship("AssistantKnowledge", back_populates="event", cascade="all, delete-orphan")
    knowledge_chunks = relationship("KnowledgeChunk", back_populates="event", cascade="all, delete-orphan")
    news = relationship("News", back_populates="event", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Event(id={self.id}, title={self.title})>"
