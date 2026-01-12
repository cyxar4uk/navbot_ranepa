from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import ModuleCreate, ModuleUpdate, ModuleResponse, ModuleReorder
from app.services import ModuleService
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()


@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get module by ID"""
    service = ModuleService(db)
    module = await service.get_by_id(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.post("", response_model=ModuleResponse)
async def create_module(
    data: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new module (admin only)"""
    service = ModuleService(db)
    module = await service.create(data)
    return module


@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(
    module_id: UUID,
    data: ModuleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a module (admin only)"""
    service = ModuleService(db)
    module = await service.update(module_id, data)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.delete("/{module_id}")
async def delete_module(
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a module (admin only)"""
    service = ModuleService(db)
    success = await service.delete(module_id)
    if not success:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"success": True}


@router.put("/reorder/{event_id}")
async def reorder_modules(
    event_id: UUID,
    data: ModuleReorder,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Reorder modules for an event (admin only)"""
    service = ModuleService(db)
    success = await service.reorder(event_id, data.module_ids)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid module IDs")
    return {"success": True}


@router.get("/types/list")
async def get_module_types(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get available module types (admin only)"""
    service = ModuleService(db)
    return await service.get_module_types()
