from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.services import UserService
from app.utils.telegram_auth import validate_telegram_init_data, extract_telegram_user
from app.config import settings

# Константы
BEARER_PREFIX = "Bearer "
DEV_USER_TELEGRAM_ID = 999999999
DEV_TOKEN = "dev"


async def _get_or_create_dev_user(db: AsyncSession) -> User:
    """Get or create dev user and make admin (for DEBUG mode only)"""
    user_service = UserService(db)
    dev_user = await user_service.get_or_create(
        telegram_id=DEV_USER_TELEGRAM_ID,
        username="dev_user",
        first_name="Dev",
        last_name="User"
    )
    # Make dev user admin if not already
    if dev_user.role != "admin":
        dev_user = await user_service.update_role(dev_user.id, "admin")
    return dev_user


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current user from Telegram init data.
    
    Authorization header format: Bearer <telegram_init_data>
    In DEBUG mode, if no authorization provided, creates a dev user.
    """
    # In DEBUG mode, allow dev user if no authorization
    if settings.DEBUG and not authorization:
        return await _get_or_create_dev_user(db)
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    if not authorization.startswith(BEARER_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format"
        )
    
    init_data = authorization[len(BEARER_PREFIX):]  # Remove "Bearer " prefix
    
    # In DEBUG mode, allow "dev" as a special token
    if settings.DEBUG and init_data == DEV_TOKEN:
        return await _get_or_create_dev_user(db)
    
    # Validate telegram init data
    if settings.DEBUG:
        # In debug mode, allow without full validation
        # ВАЖНО: В production DEBUG должен быть False!
        user_data = extract_telegram_user(init_data)
    else:
        user_data = validate_telegram_init_data(init_data)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication"
        )
    
    # Проверка обязательных полей
    telegram_id = user_data.get("id")
    if not telegram_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram user data: missing user ID"
        )
    
    # Get or create user
    user_service = UserService(db)
    user = await user_service.get_or_create(
        telegram_id=telegram_id,
        username=user_data.get("username"),
        first_name=user_data.get("first_name"),
        last_name=user_data.get("last_name")
    )
    
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify admin role"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not authorization or not authorization.startswith(BEARER_PREFIX):
        return None
    
    try:
        return await get_current_user(authorization, db)
    except HTTPException as e:
        # Перехватываем только ошибки аутентификации/авторизации
        if e.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
            return None
        # Пробрасываем остальные ошибки (500 и т.д.)
        raise
