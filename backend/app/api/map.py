from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Location, Zone
from app.schemas import LocationCreate, LocationUpdate, LocationResponse, ZoneCreate, ZoneResponse, MapDataResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()


@router.get("/events/{event_id}/map", response_model=MapDataResponse)
async def get_map_data(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get map data for an event"""
    # Get zones
    zones_query = select(Zone).where(Zone.event_id == event_id)
    zones_result = await db.execute(zones_query)
    zones = zones_result.scalars().all()
    
    # Get locations
    locations_query = select(Location).where(Location.event_id == event_id)
    locations_result = await db.execute(locations_query)
    locations = locations_result.scalars().all()
    
    return MapDataResponse(
        zones=[ZoneResponse.model_validate(z) for z in zones],
        locations=[LocationResponse.model_validate(l) for l in locations]
    )


@router.get("/locations/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get location by ID"""
    location = await db.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    result = LocationResponse.model_validate(location)
    if location.zone:
        result.zone_name = location.zone.name
    
    return result


@router.post("/locations", response_model=LocationResponse)
async def create_location(
    data: LocationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new location (admin only)"""
    location = Location(**data.model_dump())
    db.add(location)
    await db.flush()
    await db.refresh(location)
    return location


@router.put("/locations/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: UUID,
    data: LocationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a location (admin only)"""
    location = await db.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(location, field, value)
    
    await db.flush()
    await db.refresh(location)
    return location


@router.delete("/locations/{location_id}")
async def delete_location(
    location_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a location (admin only)"""
    location = await db.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    await db.delete(location)
    return {"success": True}


@router.post("/zones", response_model=ZoneResponse)
async def create_zone(
    data: ZoneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new zone (admin only)"""
    zone = Zone(**data.model_dump())
    db.add(zone)
    await db.flush()
    await db.refresh(zone)
    return zone


@router.delete("/zones/{zone_id}")
async def delete_zone(
    zone_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a zone (admin only)"""
    zone = await db.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    await db.delete(zone)
    return {"success": True}
