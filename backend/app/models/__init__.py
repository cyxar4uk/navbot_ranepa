from app.models.event import Event
from app.models.module import Module
from app.models.user import User
from app.models.event_item import EventItem
from app.models.speaker import Speaker, EventSpeaker
from app.models.registration import Registration
from app.models.location import Location, Zone
from app.models.assistant import AssistantKnowledge
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.news import News
from app.models.message import Message

__all__ = [
    "Event",
    "Module",
    "User",
    "EventItem",
    "Speaker",
    "EventSpeaker",
    "Registration",
    "Location",
    "Zone",
    "AssistantKnowledge",
    "News",
    "Message",
]
