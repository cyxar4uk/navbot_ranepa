from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class EventItem(Base):
    """EventItem model - элементы программы мероприятия"""
    __tablename__ = "event_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date_start = Column(DateTime(timezone=True), nullable=True)
    date_end = Column(DateTime(timezone=True), nullable=True)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    
    capacity = Column(Integer, nullable=True)
    registered_count = Column(Integer, default=0)
    
    type = Column(String(50), nullable=True)  # lecture, workshop, networking, etc.
    status = Column(String(20), default="active")  # active, cancelled, finished
    
    metadata = Column(JSONB, default={})  # Additional data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="event_items")
    module = relationship("Module", back_populates="event_items")
    location = relationship("Location", back_populates="event_items")
    registrations = relationship("Registration", back_populates="event_item", cascade="all, delete-orphan")
    speakers = relationship("EventSpeaker", back_populates="event_item", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<EventItem(id={self.id}, title={self.title})>"
    
    @property
    def available_spots(self) -> int | None:
        if self.capacity is None:
            return None
        return max(0, self.capacity - self.registered_count)
    
    @property
    def is_full(self) -> bool:
        if self.capacity is None:
            return False
        return self.registered_count >= self.capacity
