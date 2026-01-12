from uuid import UUID
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas import UserCreate


class UserService:
    """Service for User operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        query = select(User).where(User.id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID"""
        query = select(User).where(User.telegram_id == telegram_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_or_create(
        self,
        telegram_id: int,
        username: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None
    ) -> User:
        """Get existing user or create new one"""
        user = await self.get_by_telegram_id(telegram_id)
        
        if user:
            # Update user info if changed
            updated = False
            if username and user.username != username:
                user.username = username
                updated = True
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated = True
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                updated = True
            
            if updated:
                await self.db.flush()
                await self.db.refresh(user)
            
            return user
        
        # Create new user
        user = User(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            role="user"
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def update_role(self, user_id: UUID, role: str) -> Optional[User]:
        """Update user role"""
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        user.role = role
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def make_admin(self, telegram_id: int) -> Optional[User]:
        """Make user an admin by Telegram ID"""
        user = await self.get_by_telegram_id(telegram_id)
        if not user:
            return None
        
        user.role = "admin"
        await self.db.flush()
        await self.db.refresh(user)
        return user
