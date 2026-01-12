from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import EventResponse, EventListResponse, ModuleResponse
from app.services import EventService, ModuleService
from app.api.deps import get_current_user, get_optional_user

router = APIRouter()


@router.get("", response_model=EventListResponse)
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get all events"""
    service = EventService(db)
    events, total = await service.get_all(skip=skip, limit=limit)
    return EventListResponse(
        items=[EventResponse.model_validate(e) for e in events],
        total=total
    )


@router.get("/active", response_model=EventResponse)
async def get_active_event(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get currently active event"""
    service = EventService(db)
    event = await service.get_active()
    if not event:
        raise HTTPException(status_code=404, detail="No active event found")
    return event


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get event by ID"""
    service = EventService(db)
    event = await service.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{event_id}/modules", response_model=list[ModuleResponse])
async def get_event_modules(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get modules for an event (enabled only)"""
    service = ModuleService(db)
    modules = await service.get_by_event(event_id, enabled_only=True)
    return [ModuleResponse.model_validate(m) for m in modules]


@router.get("/{event_id}/items")
async def get_event_items(
    event_id: UUID,
    day: str = Query(None),
    type: str = Query(None),
    location: UUID = Query(None),
    search: str = Query(None),
    available_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get event items for an event with filters"""
    from datetime import date as date_type
    from app.services import EventItemService
    from app.schemas import EventItemFilter, EventItemResponse
    
    # Parse day filter
    day_filter = None
    if day:
        try:
            day_filter = date_type.fromisoformat(day)
        except ValueError:
            pass
    
    filters = EventItemFilter(
        day=day_filter,
        type=type,
        location_id=location,
        search=search,
        available_only=available_only
    )
    
    service = EventItemService(db)
    items = await service.get_by_event(event_id, filters)
    
    result = []
    for item in items:
        item_dict = EventItemResponse.model_validate(item).model_dump()
        item_dict["available_spots"] = item.available_spots
        item_dict["is_full"] = item.is_full
        
        # Add location name
        if item.location:
            item_dict["location_name"] = item.location.name
        
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
        item_dict["speakers"] = speakers
        
        result.append(item_dict)
    
    return result


@router.get("/{event_id}/speakers")
async def get_event_speakers(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get speakers for an event"""
    from sqlalchemy import select
    from app.models import Speaker
    from app.schemas import SpeakerResponse
    
    query = select(Speaker).where(Speaker.event_id == event_id)
    result = await db.execute(query)
    speakers = result.scalars().all()
    
    return [SpeakerResponse.model_validate(s) for s in speakers]


@router.get("/{event_id}/days")
async def get_event_days(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get days with events"""
    from app.services import EventItemService
    
    service = EventItemService(db)
    days = await service.get_days(event_id)
    return [d.isoformat() for d in days]


@router.get("/{event_id}/types")
async def get_event_types(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Get unique event item types"""
    from app.services import EventItemService
    
    service = EventItemService(db)
    types = await service.get_unique_types(event_id)
    return types
