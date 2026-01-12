from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


@router.post("/validate")
async def validate_auth(current_user: User = Depends(get_current_user)):
    """Validate authentication and return user info"""
    return {
        "valid": True,
        "user": UserResponse.model_validate(current_user)
    }
