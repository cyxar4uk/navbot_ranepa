from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Module(Base):
    """Module model - модули события для Dashboard"""
    __tablename__ = "modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    type = Column(String(50), nullable=False)  # program, event_list, map, registration, external_link, custom_page, assistant, news, messages
    title = Column(String(255), nullable=False)
    icon = Column(String(10), nullable=True)  # emoji or icon code
    enabled = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    
    badge_type = Column(String(20), default="none")  # none, count, dot
    badge_value = Column(String(50), nullable=True)
    
    config = Column(JSONB, default={})  # JSON configuration for the module
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="modules")
    event_items = relationship("EventItem", back_populates="module")
    
    def __repr__(self):
        return f"<Module(id={self.id}, type={self.type}, title={self.title})>"
