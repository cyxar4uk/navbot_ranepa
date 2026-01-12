from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, News
from app.schemas import NewsCreate, NewsUpdate, NewsResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()


@router.get("/events/{event_id}/news", response_model=list[NewsResponse])
async def get_event_news(
    event_id: UUID,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get news for an event"""
    query = (
        select(News)
        .where(News.event_id == event_id)
        .order_by(News.published_at.desc().nullslast())
        .limit(limit)
    )
    result = await db.execute(query)
    news = result.scalars().all()
    return [NewsResponse.model_validate(n) for n in news]


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(
    news_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get news by ID"""
    news = await db.get(News, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    return news


@router.post("", response_model=NewsResponse)
async def create_news(
    data: NewsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create news (admin only)"""
    news = News(**data.model_dump())
    db.add(news)
    await db.flush()
    await db.refresh(news)
    return news


@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: UUID,
    data: NewsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update news (admin only)"""
    news = await db.get(News, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(news, field, value)
    
    await db.flush()
    await db.refresh(news)
    return news


@router.delete("/{news_id}")
async def delete_news(
    news_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete news (admin only)"""
    news = await db.get(News, news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    await db.delete(news)
    return {"success": True}
