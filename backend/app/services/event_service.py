from uuid import UUID
from datetime import datetime
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event
from app.schemas import EventCreate, EventUpdate


class EventService:
    """Service for Event operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> tuple[list[Event], int]:
        """Get all events with pagination"""
        # Get total count
        count_query = select(func.count()).select_from(Event)
        total = await self.db.scalar(count_query)
        
        # Get events
        query = select(Event).order_by(Event.date_start.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        events = result.scalars().all()
        
        return list(events), total or 0
    
    async def get_by_id(self, event_id: UUID) -> Optional[Event]:
        """Get event by ID"""
        query = select(Event).where(Event.id == event_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_active(self) -> Optional[Event]:
        """Get currently active event (by date)"""
        now = datetime.utcnow()
        
        # First try to find an event marked as active
        query = select(Event).where(Event.status == "active").limit(1)
        result = await self.db.execute(query)
        event = result.scalar_one_or_none()
        
        if event:
            return event
        
        # Otherwise find by date range
        query = select(Event).where(
            Event.date_start <= now,
            Event.date_end >= now
        ).limit(1)
        result = await self.db.execute(query)
        event = result.scalar_one_or_none()
        
        if event:
            return event
        
        # If no active event, return the nearest upcoming one
        query = select(Event).where(
            Event.date_start > now
        ).order_by(Event.date_start.asc()).limit(1)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, data: EventCreate) -> Event:
        """Create a new event"""
        event = Event(**data.model_dump())
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event
    
    async def update(self, event_id: UUID, data: EventUpdate) -> Optional[Event]:
        """Update an event"""
        event = await self.get_by_id(event_id)
        if not event:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        
        await self.db.flush()
        await self.db.refresh(event)
        return event
    
    async def delete(self, event_id: UUID) -> bool:
        """Delete an event"""
        event = await self.get_by_id(event_id)
        if not event:
            return False
        
        await self.db.delete(event)
        return True
