from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Speaker(Base):
    """Speaker model - спикеры мероприятий"""
    __tablename__ = "speakers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    position = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    
    social_links = Column(JSONB, default={})  # {"telegram": "...", "linkedin": "...", etc.}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="speakers")
    event_items = relationship("EventSpeaker", back_populates="speaker", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Speaker(id={self.id}, name={self.name})>"


class EventSpeaker(Base):
    """EventSpeaker model - связь многие-ко-многим между EventItem и Speaker"""
    __tablename__ = "event_speakers"
    
    event_item_id = Column(UUID(as_uuid=True), ForeignKey("event_items.id", ondelete="CASCADE"), primary_key=True)
    speaker_id = Column(UUID(as_uuid=True), ForeignKey("speakers.id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    event_item = relationship("EventItem", back_populates="speakers")
    speaker = relationship("Speaker", back_populates="event_items")
