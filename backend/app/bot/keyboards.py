from aiogram.types import (
    ReplyKeyboardMarkup, KeyboardButton,
    InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo
)

from app.config import settings


def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Get main reply keyboard"""
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="📱 Открыть приложение",
                    web_app=WebAppInfo(url=settings.TELEGRAM_WEBAPP_URL) if settings.TELEGRAM_WEBAPP_URL else None
                )
            ],
            [
                KeyboardButton(text="📖 Справка"),
            ]
        ],
        resize_keyboard=True
    )
    return keyboard


def get_webapp_keyboard() -> InlineKeyboardMarkup:
    """Get inline keyboard with WebApp button"""
    if not settings.TELEGRAM_WEBAPP_URL:
        # Fallback if webapp URL not configured
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="⚙️ Приложение в разработке",
                        callback_data="app_not_ready"
                    )
                ]
            ]
        )
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📱 Открыть приложение",
                    web_app=WebAppInfo(url=settings.TELEGRAM_WEBAPP_URL)
                )
            ]
        ]
    )
    return keyboard


def get_event_keyboard(event_id: str) -> InlineKeyboardMarkup:
    """Get keyboard for event actions"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📝 Записаться",
                    callback_data=f"register_{event_id}"
                ),
                InlineKeyboardButton(
                    text="📍 На карте",
                    callback_data=f"map_{event_id}"
                )
            ],
            [
                InlineKeyboardButton(
                    text="💬 Задать вопрос",
                    callback_data=f"ask_{event_id}"
                )
            ]
        ]
    )
    return keyboard


def get_admin_keyboard() -> InlineKeyboardMarkup:
    """Get admin keyboard"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📊 Статистика",
                    callback_data="admin_stats"
                ),
                InlineKeyboardButton(
                    text="📝 Управление",
                    callback_data="admin_manage"
                )
            ],
            [
                InlineKeyboardButton(
                    text="📱 Открыть админку",
                    web_app=WebAppInfo(url=f"{settings.TELEGRAM_WEBAPP_URL}?admin=true") if settings.TELEGRAM_WEBAPP_URL else None
                )
            ]
        ]
    )
    return keyboard
