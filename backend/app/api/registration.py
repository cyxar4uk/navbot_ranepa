from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import RegistrationResponse
from app.services import RegistrationService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/registrations/my", response_model=list[RegistrationResponse])
async def get_my_registrations(
    event_id: UUID = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's registrations"""
    service = RegistrationService(db)
    registrations = await service.get_by_user(current_user.id, event_id)
    
    result = []
    for reg in registrations:
        reg_dict = RegistrationResponse.model_validate(reg).model_dump()
        # Add event item title
        if reg.event_item:
            reg_dict["event_item_title"] = reg.event_item.title
        result.append(reg_dict)
    
    return result


@router.get("/registrations/{event_item_id}/check")
async def check_registration(
    event_item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if user is registered for an event item"""
    service = RegistrationService(db)
    registration = await service.get_registration(current_user.id, event_item_id)
    
    return {
        "registered": registration is not None and registration.status != "cancelled",
        "status": registration.status if registration else None
    }
