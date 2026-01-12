from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import AssistantChatRequest, AssistantChatResponse
from app.services import AssistantService
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/chat", response_model=AssistantChatResponse)
async def chat(
    data: AssistantChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send message to AI assistant"""
    service = AssistantService(db)
    response, sources = await service.chat(
        event_id=data.event_id,
        message=data.message,
        context=data.context
    )
    
    return AssistantChatResponse(response=response, sources=sources)
