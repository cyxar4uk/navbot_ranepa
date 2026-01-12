from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Zone(Base):
    """Zone model - зоны на карте"""
    __tablename__ = "zones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    floor = Column(Integer, nullable=True)
    coordinates = Column(JSONB, default={})  # SVG path or coordinates
    map_data = Column(JSONB, default={})  # Additional map data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="zones")
    locations = relationship("Location", back_populates="zone")
    
    def __repr__(self):
        return f"<Zone(id={self.id}, name={self.name})>"


class Location(Base):
    """Location model - локации/помещения на карте"""
    __tablename__ = "locations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    floor = Column(Integer, nullable=True)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True)
    coordinates = Column(JSONB, default={})  # {"x": 100, "y": 200} or SVG path
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="locations")
    zone = relationship("Zone", back_populates="locations")
    event_items = relationship("EventItem", back_populates="location")
    
    def __repr__(self):
        return f"<Location(id={self.id}, name={self.name})>"
