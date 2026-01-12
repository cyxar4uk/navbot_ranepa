from uuid import UUID
from datetime import datetime
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Registration, EventItem, User


class RegistrationService:
    """Service for Registration operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_user(self, user_id: UUID, event_id: Optional[UUID] = None) -> list[Registration]:
        """Get all registrations for a user"""
        query = select(Registration).where(Registration.user_id == user_id)
        
        if event_id:
            query = query.join(EventItem).where(EventItem.event_id == event_id)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_by_event_item(self, event_item_id: UUID) -> list[Registration]:
        """Get all registrations for an event item"""
        query = select(Registration).where(Registration.event_item_id == event_item_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_registration(self, user_id: UUID, event_item_id: UUID) -> Optional[Registration]:
        """Get specific registration"""
        query = select(Registration).where(
            Registration.user_id == user_id,
            Registration.event_item_id == event_item_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def register(
        self,
        user_id: UUID,
        event_item_id: UUID,
        approval_required: bool = False
    ) -> tuple[Optional[Registration], str]:
        """
        Register user for an event item.
        
        Returns:
            Tuple of (Registration or None, status message)
        """
        # Check if already registered
        existing = await self.get_registration(user_id, event_item_id)
        if existing:
            if existing.status == "cancelled":
                # Re-activate cancelled registration
                existing.status = "confirmed" if not approval_required else "pending"
                existing.registered_at = datetime.utcnow()
                await self._update_registered_count(event_item_id, 1)
                await self.db.flush()
                await self.db.refresh(existing)
                return existing, "Регистрация восстановлена"
            return None, "Вы уже зарегистрированы на это мероприятие"
        
        # Check capacity
        event_item = await self.db.get(EventItem, event_item_id)
        if not event_item:
            return None, "Мероприятие не найдено"
        
        if event_item.capacity is not None and event_item.registered_count >= event_item.capacity:
            return None, "Все места заняты"
        
        # Create registration
        registration = Registration(
            user_id=user_id,
            event_item_id=event_item_id,
            status="confirmed" if not approval_required else "pending",
            registered_at=datetime.utcnow()
        )
        
        if not approval_required:
            registration.approved_at = datetime.utcnow()
        
        self.db.add(registration)
        await self._update_registered_count(event_item_id, 1)
        await self.db.flush()
        await self.db.refresh(registration)
        
        return registration, "Регистрация успешна"
    
    async def cancel(self, user_id: UUID, event_item_id: UUID) -> tuple[bool, str]:
        """
        Cancel registration.
        
        Returns:
            Tuple of (success, status message)
        """
        registration = await self.get_registration(user_id, event_item_id)
        if not registration:
            return False, "Регистрация не найдена"
        
        if registration.status == "cancelled":
            return False, "Регистрация уже отменена"
        
        registration.status = "cancelled"
        await self._update_registered_count(event_item_id, -1)
        await self.db.flush()
        
        return True, "Регистрация отменена"
    
    async def approve(self, registration_id: UUID) -> Optional[Registration]:
        """Approve a pending registration (admin only)"""
        query = select(Registration).where(Registration.id == registration_id)
        result = await self.db.execute(query)
        registration = result.scalar_one_or_none()
        
        if not registration or registration.status != "pending":
            return None
        
        registration.status = "confirmed"
        registration.approved_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(registration)
        
        return registration
    
    async def _update_registered_count(self, event_item_id: UUID, delta: int):
        """Update registered count for an event item"""
        stmt = (
            update(EventItem)
            .where(EventItem.id == event_item_id)
            .values(registered_count=EventItem.registered_count + delta)
        )
        await self.db.execute(stmt)
