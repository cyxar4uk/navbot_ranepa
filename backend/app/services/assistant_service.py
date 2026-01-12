from uuid import UUID
from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event, EventItem, AssistantKnowledge, EventSpeaker, KnowledgeChunk
from app.services.knowledge_chunk_service import KnowledgeChunkService
from app.utils.llm_client import llm_client


class AssistantService:
    """Service for AI Assistant operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def chat(
        self,
        event_id: UUID,
        message: str,
        context: Optional[dict] = None
    ) -> tuple[str, list[str], list[dict]]:
        """
        Process chat message and generate response.
        
        Args:
            event_id: ID of the current event
            message: User's message
            context: Optional context (module_id, item_id)
            
        Returns:
            Tuple of (response text, list of sources)
        """
        # Get event info
        event = await self.db.get(Event, event_id)
        if not event:
            return "Мероприятие не найдено.", [], []
        
        chunk_service = KnowledgeChunkService(self.db)
        # Build knowledge base
        knowledge_base = await self._build_knowledge_base(event, message, chunk_service)
        
        # Build system prompt
        system_prompt = llm_client.build_system_prompt(event.title, knowledge_base)
        
        # Build context string
        context_str = await self._build_context_string(event_id, context)
        
        # Generate response
        response = await llm_client.generate_response(
            system_prompt=system_prompt,
            user_message=message,
            context=context_str
        )
        
        # Extract sources (simplified - just mention knowledge was used)
        sources = ["База знаний мероприятия"] if knowledge_base else []

        actions: list[dict] = []
        try:
            item_id = (context or {}).get("item_id")
            if item_id:
                item = await self.db.get(EventItem, item_id)
                if item and item.location_id:
                    actions.append({
                        "type": "open_map",
                        "label": "Открыть на карте",
                        "location_id": item.location_id,
                    })
        except Exception:
            pass

        return response, sources, actions
    
    async def _build_knowledge_base(
        self,
        event: Event,
        message: str,
        chunk_service: KnowledgeChunkService
    ) -> list[str]:
        """Build knowledge base for the assistant"""
        knowledge_items: list[str] = []

        result = await self.db.execute(
            select(KnowledgeChunk).where(KnowledgeChunk.event_id == event.id)
        )
        if result.scalars().first() is None:
            await chunk_service.refresh_event_chunks(event.id)

        result = await self.db.execute(
            select(KnowledgeChunk).where(KnowledgeChunk.event_id.is_(None))
        )
        if result.scalars().first() is None:
            await chunk_service.refresh_global_chunks()

        relevant_chunks = await chunk_service.get_relevant_chunks(event.id, message)
        knowledge_items.extend([chunk.content for chunk in relevant_chunks])

        return knowledge_items
    
    async def _build_context_string(
        self,
        event_id: UUID,
        context: Optional[dict] = None
    ) -> str:
        """Build additional context string for specific item/module"""
        if not context:
            return ""
        
        parts = []
        
        # Add specific event item context
        if context.get("item_id"):
            item = await self.db.get(
                EventItem,
                context["item_id"],
                options=[
                    selectinload(EventItem.location),
                    selectinload(EventItem.speakers).selectinload(EventSpeaker.speaker),
                ]
            )
            if item:
                parts.append(f"Пользователь смотрит: {item.title}")
                if item.date_start:
                    time_str = item.date_start.strftime("%d.%m %H:%M")
                    if item.date_end:
                        time_str += f" - {item.date_end.strftime('%H:%M')}"
                    parts.append(f"Время: {time_str}")
                if item.location:
                    parts.append(f"Локация: {item.location.name}")
                if item.description:
                    parts.append(f"Описание: {item.description}")
                speakers = [
                    event_speaker.speaker.name
                    for event_speaker in item.speakers
                    if event_speaker.speaker
                ]
                if speakers:
                    parts.append(f"Спикеры: {', '.join(speakers)}")
        
        return "\n".join(parts)
    
    async def add_knowledge(
        self,
        event_id: Optional[UUID],
        content: str,
        content_type: Optional[str] = None
    ) -> AssistantKnowledge:
        """Add knowledge entry"""
        knowledge = AssistantKnowledge(
            event_id=event_id,
            content=content,
            content_type=content_type
        )
        self.db.add(knowledge)
        await self.db.flush()
        await self.db.refresh(knowledge)
        chunk_service = KnowledgeChunkService(self.db)
        if event_id:
            await chunk_service.refresh_event_chunks(event_id)
        else:
            await chunk_service.refresh_global_chunks()
        return knowledge
    
    async def get_knowledge(self, event_id: Optional[UUID] = None) -> list[AssistantKnowledge]:
        """Get knowledge entries"""
        if event_id:
            query = select(AssistantKnowledge).where(
                (AssistantKnowledge.event_id == event_id) | 
                (AssistantKnowledge.event_id.is_(None))
            )
        else:
            query = select(AssistantKnowledge).where(AssistantKnowledge.event_id.is_(None))
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
