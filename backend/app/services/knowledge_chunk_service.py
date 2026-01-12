from __future__ import annotations

from typing import Iterable, Optional
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    AssistantKnowledge,
    Event,
    EventItem,
    EventSpeaker,
    KnowledgeChunk,
    Location,
    Speaker,
)


class KnowledgeChunkService:
    """Service for building and retrieving knowledge chunks."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def refresh_event_chunks(self, event_id: UUID) -> list[KnowledgeChunk]:
        """Rebuild chunks for a specific event."""
        event = await self.db.get(Event, event_id)
        if not event:
            return []

        await self.db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.event_id == event_id))

        chunks = await self._build_event_chunks(event)
        self.db.add_all(chunks)
        await self.db.flush()
        return chunks

    async def refresh_global_chunks(self) -> list[KnowledgeChunk]:
        """Rebuild global chunks (event_id = NULL)."""
        await self.db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.event_id.is_(None)))
        chunks = await self._build_global_chunks()
        self.db.add_all(chunks)
        await self.db.flush()
        return chunks

    async def get_relevant_chunks(
        self,
        event_id: UUID,
        query: str,
        limit: int = 8
    ) -> list[KnowledgeChunk]:
        """Get most relevant chunks for a query using keyword scoring."""
        chunks = await self._load_chunks(event_id)
        if not chunks:
            return []

        tokens = self._tokenize(query)
        ranked = sorted(
            chunks,
            key=lambda chunk: self._score_chunk(chunk.content, tokens),
            reverse=True
        )
        matched = [chunk for chunk in ranked if self._score_chunk(chunk.content, tokens) > 0]
        if matched:
            return matched[:limit]
        return ranked[:limit]

    async def _load_chunks(self, event_id: UUID) -> list[KnowledgeChunk]:
        result = await self.db.execute(
            select(KnowledgeChunk).where(
                (KnowledgeChunk.event_id == event_id) | (KnowledgeChunk.event_id.is_(None))
            )
        )
        return list(result.scalars().all())

    async def _build_global_chunks(self) -> list[KnowledgeChunk]:
        chunks: list[KnowledgeChunk] = []
        result = await self.db.execute(
            select(AssistantKnowledge).where(AssistantKnowledge.event_id.is_(None))
        )
        for item in result.scalars().all():
            chunks.append(
                KnowledgeChunk(
                    event_id=None,
                    chunk_type=item.content_type or "global",
                    content=item.content,
                    extra_data=item.extra_data or {},
                )
            )
        return chunks

    async def _build_event_chunks(self, event: Event) -> list[KnowledgeChunk]:
        chunks: list[KnowledgeChunk] = []

        date_range = ""
        if event.date_start and event.date_end:
            date_range = f"{event.date_start.strftime('%d.%m %H:%M')} - {event.date_end.strftime('%H:%M')}"
        elif event.date_start:
            date_range = event.date_start.strftime("%d.%m %H:%M")

        summary = f"Мероприятие «{event.title}»."
        if date_range:
            summary += f" Время: {date_range}."
        if event.location:
            summary += f" Место: {event.location}."
        if event.description:
            summary += f" {event.description}"

        chunks.append(
            KnowledgeChunk(
                event_id=event.id,
                chunk_type="event",
                content=summary,
                extra_data={},
            )
        )

        result = await self.db.execute(
            select(AssistantKnowledge).where(AssistantKnowledge.event_id == event.id)
        )
        for item in result.scalars().all():
            chunks.append(
                KnowledgeChunk(
                    event_id=event.id,
                    chunk_type=item.content_type or "event_knowledge",
                    content=item.content,
                    extra_data=item.extra_data or {},
                )
            )

        items_result = await self.db.execute(
            select(EventItem)
            .where(EventItem.event_id == event.id)
            .options(
                selectinload(EventItem.location),
                selectinload(EventItem.speakers).selectinload(EventSpeaker.speaker),
            )
        )
        for item in items_result.scalars().all():
            time_str = ""
            if item.date_start:
                time_str = item.date_start.strftime("%d.%m %H:%M")
                if item.date_end:
                    time_str += f" - {item.date_end.strftime('%H:%M')}"

            location_str = f" Локация: {item.location.name}." if item.location else ""
            speakers = [
                event_speaker.speaker.name
                for event_speaker in item.speakers
                if event_speaker.speaker
            ]
            speakers_str = f" Спикеры: {', '.join(speakers)}." if speakers else ""

            content = f"{item.title}."
            if time_str:
                content += f" Время: {time_str}."
            if item.description:
                content += f" {item.description}"
            content += f"{location_str}{speakers_str}"

            chunks.append(
                KnowledgeChunk(
                    event_id=event.id,
                    chunk_type="program",
                    content=content,
                    extra_data={"item_id": str(item.id)},
                )
            )

        speakers_result = await self.db.execute(
            select(Speaker).where(Speaker.event_id == event.id)
        )
        for speaker in speakers_result.scalars().all():
            text = f"{speaker.name}."
            if speaker.position or speaker.company:
                text += f" {speaker.position or ''} {speaker.company or ''}".strip()
                text += "."
            if speaker.bio:
                text += f" {speaker.bio}"
            chunks.append(
                KnowledgeChunk(
                    event_id=event.id,
                    chunk_type="speaker",
                    content=text,
                    extra_data={"speaker_id": str(speaker.id)},
                )
            )

        locations_result = await self.db.execute(
            select(Location).where(Location.event_id == event.id)
        )
        for location in locations_result.scalars().all():
            floor_str = f"Этаж {location.floor}." if location.floor is not None else ""
            text = f"{location.name}. {floor_str} {location.description or ''}".strip()
            chunks.append(
                KnowledgeChunk(
                    event_id=event.id,
                    chunk_type="location",
                    content=text,
                    extra_data={"location_id": str(location.id)},
                )
            )

        return chunks

    def _tokenize(self, text: str) -> list[str]:
        return [token for token in text.lower().split() if len(token) > 2]

    def _score_chunk(self, content: str, tokens: Iterable[str]) -> int:
        text = content.lower()
        return sum(text.count(token) for token in tokens)
