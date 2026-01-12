from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import EventItemCreate, EventItemUpdate, EventItemResponse
from app.services import EventItemService
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()


@router.get("/{item_id}")
async def get_event_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get event item by ID"""
    service = EventItemService(db)
    item = await service.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Event item not found")
    
    result = EventItemResponse.model_validate(item).model_dump()
    result["available_spots"] = item.available_spots
    result["is_full"] = item.is_full
    
    # Add location name
    if item.location:
        result["location_name"] = item.location.name
    
    # Add speakers
    speakers = []
    for es in item.speakers:
        speakers.append({
            "id": str(es.speaker.id),
            "name": es.speaker.name,
            "position": es.speaker.position,
            "company": es.speaker.company,
            "photo_url": es.speaker.photo_url
        })
    result["speakers"] = speakers
    
    return result


@router.post("", response_model=EventItemResponse)
async def create_event_item(
    data: EventItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new event item (admin only)"""
    service = EventItemService(db)
    item = await service.create(data)
    return item


@router.put("/{item_id}", response_model=EventItemResponse)
async def update_event_item(
    item_id: UUID,
    data: EventItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update an event item (admin only)"""
    service = EventItemService(db)
    item = await service.update(item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Event item not found")
    return item


@router.delete("/{item_id}")
async def delete_event_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete an event item (admin only)"""
    service = EventItemService(db)
    success = await service.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event item not found")
    return {"success": True}


@router.post("/{item_id}/register")
async def register_for_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register for an event item"""
    from app.services import RegistrationService
    
    service = RegistrationService(db)
    registration, message = await service.register(current_user.id, item_id)
    
    if not registration:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "message": message,
        "registration_id": str(registration.id),
        "status": registration.status
    }


@router.delete("/{item_id}/register")
async def cancel_registration(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel registration for an event item"""
    from app.services import RegistrationService
    
    service = RegistrationService(db)
    success, message = await service.cancel(current_user.id, item_id)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"success": True, "message": message}
