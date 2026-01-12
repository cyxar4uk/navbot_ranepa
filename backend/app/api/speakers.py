from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Speaker
from app.schemas import SpeakerCreate, SpeakerUpdate, SpeakerResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()


@router.get("/{speaker_id}", response_model=SpeakerResponse)
async def get_speaker(
    speaker_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get speaker by ID"""
    speaker = await db.get(Speaker, speaker_id)
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    return speaker


@router.post("", response_model=SpeakerResponse)
async def create_speaker(
    data: SpeakerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new speaker (admin only)"""
    speaker = Speaker(**data.model_dump())
    db.add(speaker)
    await db.flush()
    await db.refresh(speaker)
    return speaker


@router.put("/{speaker_id}", response_model=SpeakerResponse)
async def update_speaker(
    speaker_id: UUID,
    data: SpeakerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a speaker (admin only)"""
    speaker = await db.get(Speaker, speaker_id)
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(speaker, field, value)
    
    await db.flush()
    await db.refresh(speaker)
    return speaker


@router.delete("/{speaker_id}")
async def delete_speaker(
    speaker_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a speaker (admin only)"""
    speaker = await db.get(Speaker, speaker_id)
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    
    await db.delete(speaker)
    return {"success": True}
