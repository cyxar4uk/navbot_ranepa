from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class TelegramAuthData(BaseModel):
    """Schema for Telegram WebApp init data"""
    query_id: Optional[str] = None
    user: Optional[dict] = None
    auth_date: int
    hash: str


class UserBase(BaseModel):
    """Base schema for User"""
    telegram_id: int
    username: Optional[str] = Field(None, max_length=255)
    first_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)


class UserCreate(UserBase):
    """Schema for creating a User"""
    role: str = Field(default="user", pattern="^(user|admin)$")


class UserResponse(UserBase):
    """Schema for User response"""
    id: UUID
    role: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
