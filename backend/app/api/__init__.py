from fastapi import APIRouter

from app.api import (
    auth,
    events,
    modules,
    event_items,
    speakers,
    registration,
    assistant,
    admin,
    map,
    news,
    admin_auth,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(event_items.router, prefix="/event-items", tags=["event-items"])
api_router.include_router(speakers.router, prefix="/speakers", tags=["speakers"])
api_router.include_router(registration.router, tags=["registration"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(admin_auth.router, prefix="/admin", tags=["admin-auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(map.router, tags=["map"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
