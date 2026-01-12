from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import (
    EventCreate, EventUpdate, EventResponse, EventListResponse,
    ModuleResponse, AssistantKnowledgeCreate, AssistantKnowledgeResponse
)
from app.services import EventService, ModuleService, AssistantService
from app.api.deps import get_current_admin
from app.api.admin_auth import get_current_admin_token

router = APIRouter(dependencies=[Depends(get_current_admin_token)])


# ==================== Events Management ====================

@router.get("/events", response_model=EventListResponse)
async def admin_get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all events (admin)"""
    service = EventService(db)
    events, total = await service.get_all(skip=skip, limit=limit)
    return EventListResponse(
        items=[EventResponse.model_validate(e) for e in events],
        total=total
    )


@router.post("/events", response_model=EventResponse)
async def admin_create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new event (admin)"""
    service = EventService(db)
    event = await service.create(data)
    return event


@router.put("/events/{event_id}", response_model=EventResponse)
async def admin_update_event(
    event_id: UUID,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update an event (admin)"""
    service = EventService(db)
    event = await service.update(event_id, data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/events/{event_id}")
async def admin_delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete an event (admin)"""
    service = EventService(db)
    success = await service.delete(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}


# ==================== Modules Management ====================

@router.get("/events/{event_id}/modules", response_model=list[ModuleResponse])
async def admin_get_event_modules(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all modules for an event (admin - includes disabled)"""
    service = ModuleService(db)
    modules = await service.get_by_event(event_id, enabled_only=False)
    return [ModuleResponse.model_validate(m) for m in modules]


@router.get("/modules/types")
async def admin_get_module_types(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get available module types (admin)"""
    service = ModuleService(db)
    return await service.get_module_types()


# ==================== Knowledge Management ====================

@router.post("/knowledge", response_model=AssistantKnowledgeResponse)
async def admin_add_knowledge(
    data: AssistantKnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Add knowledge entry (admin)"""
    service = AssistantService(db)
    knowledge = await service.add_knowledge(
        event_id=data.event_id,
        content=data.content,
        content_type=data.content_type
    )
    return knowledge


@router.get("/knowledge")
async def admin_get_knowledge(
    event_id: UUID = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get knowledge entries (admin)"""
    service = AssistantService(db)
    knowledge = await service.get_knowledge(event_id)
    return [AssistantKnowledgeResponse.model_validate(k) for k in knowledge]


# ==================== User Management ====================

@router.post("/users/{telegram_id}/make-admin")
async def admin_make_user_admin(
    telegram_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Make user an admin (admin)"""
    from app.services import UserService
    
    service = UserService(db)
    user = await service.make_admin(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user_id": str(user.id)}
