from uuid import UUID
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event, EventItem, AssistantKnowledge, Speaker, Location
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
    ) -> tuple[str, list[str]]:
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
            return "Мероприятие не найдено.", []
        
        # Build knowledge base
        knowledge_base = await self._build_knowledge_base(event_id, context)
        
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
        
        return response, sources
    
    async def _build_knowledge_base(
        self,
        event_id: UUID,
        context: Optional[dict] = None
    ) -> list[str]:
        """Build knowledge base for the assistant"""
        knowledge_items = []
        
        # Get global knowledge
        global_query = select(AssistantKnowledge).where(
            AssistantKnowledge.event_id.is_(None)
        )
        result = await self.db.execute(global_query)
        for item in result.scalars().all():
            knowledge_items.append(f"[{item.content_type or 'Общее'}]: {item.content}")
        
        # Get event-specific knowledge
        event_query = select(AssistantKnowledge).where(
            AssistantKnowledge.event_id == event_id
        )
        result = await self.db.execute(event_query)
        for item in result.scalars().all():
            knowledge_items.append(f"[{item.content_type or 'Мероприятие'}]: {item.content}")
        
        # Add event items info
        items_query = select(EventItem).where(EventItem.event_id == event_id).limit(50)
        result = await self.db.execute(items_query)
        for item in result.scalars().all():
            time_str = ""
            if item.date_start:
                time_str = item.date_start.strftime("%d.%m %H:%M")
                if item.date_end:
                    time_str += f" - {item.date_end.strftime('%H:%M')}"
            
            knowledge_items.append(
                f"[Программа] {item.title}: {time_str}. {item.description or ''}"
            )
        
        # Add speakers info
        speakers_query = select(Speaker).where(Speaker.event_id == event_id)
        result = await self.db.execute(speakers_query)
        for speaker in result.scalars().all():
            knowledge_items.append(
                f"[Спикер] {speaker.name}: {speaker.position or ''} {speaker.company or ''}. {speaker.bio or ''}"
            )
        
        # Add locations info
        locations_query = select(Location).where(Location.event_id == event_id)
        result = await self.db.execute(locations_query)
        for location in result.scalars().all():
            floor_str = f"Этаж {location.floor}" if location.floor else ""
            knowledge_items.append(
                f"[Локация] {location.name}: {floor_str}. {location.description or ''}"
            )
        
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
            item = await self.db.get(EventItem, context["item_id"])
            if item:
                parts.append(f"Пользователь смотрит: {item.title}")
                if item.description:
                    parts.append(f"Описание: {item.description}")
        
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
