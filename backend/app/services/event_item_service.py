from uuid import UUID
from datetime import datetime, date
from typing import Optional
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import EventItem, EventSpeaker, Speaker, Location
from app.schemas import EventItemCreate, EventItemUpdate, EventItemFilter


class EventItemService:
    """Service for EventItem operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_event(
        self,
        event_id: UUID,
        filters: Optional[EventItemFilter] = None
    ) -> list[EventItem]:
        """Get all event items for an event with optional filters"""
        query = (
            select(EventItem)
            .where(EventItem.event_id == event_id)
            .options(
                selectinload(EventItem.location),
                selectinload(EventItem.speakers).selectinload(EventSpeaker.speaker)
            )
        )
        
        if filters:
            # Filter by day
            if filters.day:
                start_of_day = datetime.combine(filters.day, datetime.min.time())
                end_of_day = datetime.combine(filters.day, datetime.max.time())
                query = query.where(
                    and_(
                        EventItem.date_start >= start_of_day,
                        EventItem.date_start <= end_of_day
                    )
                )
            
            # Filter by type
            if filters.type:
                query = query.where(EventItem.type == filters.type)
            
            # Filter by location
            if filters.location_id:
                query = query.where(EventItem.location_id == filters.location_id)
            
            # Search by title
            if filters.search:
                search_pattern = f"%{filters.search}%"
                query = query.where(
                    or_(
                        EventItem.title.ilike(search_pattern),
                        EventItem.description.ilike(search_pattern)
                    )
                )
            
            # Filter available only
            if filters.available_only:
                query = query.where(
                    or_(
                        EventItem.capacity.is_(None),
                        EventItem.registered_count < EventItem.capacity
                    )
                )
        
        query = query.order_by(EventItem.date_start.asc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_by_id(self, item_id: UUID) -> Optional[EventItem]:
        """Get event item by ID"""
        query = (
            select(EventItem)
            .where(EventItem.id == item_id)
            .options(
                selectinload(EventItem.location),
                selectinload(EventItem.speakers).selectinload(EventSpeaker.speaker)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, data: EventItemCreate) -> EventItem:
        """Create a new event item"""
        item_data = data.model_dump(exclude={"speaker_ids"})
        item = EventItem(**item_data)
        self.db.add(item)
        await self.db.flush()
        
        # Add speakers if provided
        if data.speaker_ids:
            for speaker_id in data.speaker_ids:
                event_speaker = EventSpeaker(
                    event_item_id=item.id,
                    speaker_id=speaker_id
                )
                self.db.add(event_speaker)
        
        await self.db.flush()
        await self.db.refresh(item)
        return item
    
    async def update(self, item_id: UUID, data: EventItemUpdate) -> Optional[EventItem]:
        """Update an event item"""
        item = await self.get_by_id(item_id)
        if not item:
            return None
        
        update_data = data.model_dump(exclude_unset=True, exclude={"speaker_ids"})
        for field, value in update_data.items():
            setattr(item, field, value)
        
        # Update speakers if provided
        if data.speaker_ids is not None:
            # Remove existing speakers
            delete_query = select(EventSpeaker).where(EventSpeaker.event_item_id == item_id)
            result = await self.db.execute(delete_query)
            for es in result.scalars().all():
                await self.db.delete(es)
            
            # Add new speakers
            for speaker_id in data.speaker_ids:
                event_speaker = EventSpeaker(
                    event_item_id=item.id,
                    speaker_id=speaker_id
                )
                self.db.add(event_speaker)
        
        await self.db.flush()
        await self.db.refresh(item)
        return item
    
    async def delete(self, item_id: UUID) -> bool:
        """Delete an event item"""
        item = await self.get_by_id(item_id)
        if not item:
            return False
        
        await self.db.delete(item)
        return True
    
    async def get_unique_types(self, event_id: UUID) -> list[str]:
        """Get unique event item types for an event"""
        query = (
            select(EventItem.type)
            .where(EventItem.event_id == event_id)
            .where(EventItem.type.isnot(None))
            .distinct()
        )
        result = await self.db.execute(query)
        return [r[0] for r in result.all()]
    
    async def get_days(self, event_id: UUID) -> list[date]:
        """Get unique days with events"""
        query = (
            select(func.date(EventItem.date_start))
            .where(EventItem.event_id == event_id)
            .where(EventItem.date_start.isnot(None))
            .distinct()
            .order_by(func.date(EventItem.date_start))
        )
        result = await self.db.execute(query)
        return [r[0] for r in result.all()]
