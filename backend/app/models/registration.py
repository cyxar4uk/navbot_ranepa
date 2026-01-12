from sqlalchemy import Column, String, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Registration(Base):
    """Registration model - записи пользователей на мероприятия"""
    __tablename__ = "registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_item_id = Column(UUID(as_uuid=True), ForeignKey("event_items.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String(20), default="confirmed")  # pending, confirmed, cancelled, waitlist
    
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Unique constraint - one registration per user per event item
    __table_args__ = (
        UniqueConstraint('event_item_id', 'user_id', name='uq_registration_event_item_user'),
    )
    
    # Relationships
    event_item = relationship("EventItem", back_populates="registrations")
    user = relationship("User", back_populates="registrations")
    
    def __repr__(self):
        return f"<Registration(id={self.id}, status={self.status})>"
