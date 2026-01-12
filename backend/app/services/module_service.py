from uuid import UUID
from typing import Optional
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Module
from app.schemas import ModuleCreate, ModuleUpdate


class ModuleService:
    """Service for Module operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_event(self, event_id: UUID, enabled_only: bool = False) -> list[Module]:
        """Get all modules for an event"""
        query = select(Module).where(Module.event_id == event_id)
        
        if enabled_only:
            query = query.where(Module.enabled == True)
        
        query = query.order_by(Module.order.asc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_by_id(self, module_id: UUID) -> Optional[Module]:
        """Get module by ID"""
        query = select(Module).where(Module.id == module_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, data: ModuleCreate) -> Module:
        """Create a new module"""
        # Get max order for the event
        max_order_query = select(func.max(Module.order)).where(Module.event_id == data.event_id)
        max_order = await self.db.scalar(max_order_query) or -1
        
        module_data = data.model_dump()
        module_data["order"] = max_order + 1
        
        module = Module(**module_data)
        self.db.add(module)
        await self.db.flush()
        await self.db.refresh(module)
        return module
    
    async def update(self, module_id: UUID, data: ModuleUpdate) -> Optional[Module]:
        """Update a module"""
        module = await self.get_by_id(module_id)
        if not module:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(module, field, value)
        
        await self.db.flush()
        await self.db.refresh(module)
        return module
    
    async def delete(self, module_id: UUID) -> bool:
        """Delete a module"""
        module = await self.get_by_id(module_id)
        if not module:
            return False
        
        await self.db.delete(module)
        return True
    
    async def reorder(self, event_id: UUID, module_ids: list[UUID]) -> bool:
        """Reorder modules for an event"""
        # Verify all modules belong to the event
        query = select(Module.id).where(
            Module.event_id == event_id,
            Module.id.in_(module_ids)
        )
        result = await self.db.execute(query)
        existing_ids = set(result.scalars().all())
        
        if len(existing_ids) != len(module_ids):
            return False
        
        # Update order for each module
        for order, module_id in enumerate(module_ids):
            stmt = (
                update(Module)
                .where(Module.id == module_id)
                .values(order=order)
            )
            await self.db.execute(stmt)
        
        return True
    
    async def get_module_types(self) -> list[dict]:
        """Get available module types with their configurations"""
        return [
            {
                "type": "program",
                "name": "Программа",
                "description": "Программа мероприятия (деловая, культурная, по дням)",
                "default_config": {
                    "grouping": "day",
                    "allow_registration": True,
                    "show_capacity": True,
                    "filters_enabled": True,
                    "event_types": [],
                    "default_view": "timeline"
                }
            },
            {
                "type": "event_list",
                "name": "Список",
                "description": "Универсальный список сущностей (спикеры, участники, партнеры)",
                "default_config": {
                    "entity_type": "speaker",
                    "card_layout": "compact",
                    "searchable": True,
                    "filterable": False,
                    "show_details": True
                }
            },
            {
                "type": "map",
                "name": "Карта",
                "description": "Интерактивная карта Академии",
                "default_config": {
                    "map_type": "svg",
                    "default_floor": 1,
                    "zones_enabled": True,
                    "link_with_events": True,
                    "show_navigation": True
                }
            },
            {
                "type": "registration",
                "name": "Запись",
                "description": "Запись на мероприятия и воркшопы",
                "default_config": {
                    "max_capacity": 30,
                    "approval_required": False,
                    "show_remaining": True,
                    "waitlist_enabled": False
                }
            },
            {
                "type": "external_link",
                "name": "Внешняя ссылка",
                "description": "Подгрузка сторонних ресурсов",
                "default_config": {
                    "url": "",
                    "open_type": "external",
                    "auth_required": False,
                    "title": ""
                }
            },
            {
                "type": "custom_page",
                "name": "Страница",
                "description": "Статическая страница (FAQ, правила, инструкции)",
                "default_config": {
                    "content_type": "markdown",
                    "content": "",
                    "editable": True
                }
            },
            {
                "type": "assistant",
                "name": "Ассистент",
                "description": "AI-ассистент для ответов на вопросы",
                "default_config": {
                    "scope": "event",
                    "allow_free_questions": True,
                    "fallback_to_operator": False,
                    "system_prompt_template": ""
                }
            },
            {
                "type": "news",
                "name": "Новости",
                "description": "Новости и анонсы мероприятия",
                "default_config": {
                    "show_images": True,
                    "show_dates": True,
                    "allow_comments": False,
                    "max_items": 20
                }
            },
            {
                "type": "messages",
                "name": "Сообщения",
                "description": "Личные сообщения пользователя",
                "default_config": {
                    "allow_sending": True,
                    "notifications_enabled": True
                }
            }
        ]
