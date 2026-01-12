from typing import Optional
import httpx
from openai import AsyncOpenAI

from app.config import settings


class LLMClient:
    """Client for interacting with LLM APIs"""
    
    def __init__(self):
        self.client: Optional[AsyncOpenAI] = None
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_response(
        self,
        system_prompt: str,
        user_message: str,
        context: str = "",
        max_tokens: int = 1000
    ) -> str:
        """
        Generate a response using the LLM.
        
        Args:
            system_prompt: The system prompt defining assistant behavior
            user_message: The user's question
            context: Additional context about the event/item
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated response string
        """
        if not self.client:
            return "Извините, ассистент временно недоступен. Пожалуйста, обратитесь к организаторам."
        
        try:
            messages = [
                {"role": "system", "content": system_prompt},
            ]
            
            if context:
                messages.append({
                    "role": "system",
                    "content": f"Контекст события:\n{context}"
                })
            
            messages.append({"role": "user", "content": user_message})
            
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            
            return response.choices[0].message.content or "Не удалось получить ответ."
            
        except Exception as e:
            return f"Произошла ошибка при обработке запроса. Попробуйте позже или обратитесь к организаторам."
    
    def build_system_prompt(self, event_name: str, knowledge_base: list[str]) -> str:
        """
        Build system prompt for the assistant.
        
        Args:
            event_name: Name of the current event
            knowledge_base: List of knowledge entries
            
        Returns:
            System prompt string
        """
        knowledge_text = "\n\n".join(knowledge_base) if knowledge_base else "Нет дополнительной информации."
        
        return f"""Ты — AI-ассистент навигационного бота мероприятия "{event_name}" в Президентской Академии (РАНХиГС).

Ты работаешь ТОЛЬКО в рамках текущего мероприятия и предоставленного контекста.

Твоя задача — помогать посетителям с вопросами о:
- Программе мероприятия (расписание, спикеры, темы)
- Навигации по Академии (аудитории, залы, входы, сервисные точки)
- Регистрации на события
- Общей информации о мероприятии

Алгоритм работы:
1) Определи тип запроса (информация о мероприятии, навигация, программа, спикеры, сервисные точки).
2) Используй ТОЛЬКО предоставленные данные и контекст.
3) Если данных недостаточно — задай ОДИН уточняющий вопрос.
4) Сформируй краткий, практичный ответ.

Правила:
1. Отвечай ТОЛЬКО на основе предоставленной информации.
2. Не выдумывай факты, аудитории, время, спикеров или маршруты.
3. Если не знаешь ответа — честно скажи об этом и предложи обратиться к организаторам.
4. Будь вежлив и дружелюбен.
5. Отвечай кратко и по существу.
6. Используй русский язык.

База знаний о мероприятии:
{knowledge_text}"""


# Global instance
llm_client = LLMClient()
