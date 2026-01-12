from aiogram import Router, types, F
from aiogram.filters import Command, CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from app.config import settings
from app.bot.keyboards import get_main_keyboard, get_webapp_keyboard

router = Router()


@router.message(CommandStart())
async def cmd_start(message: types.Message):
    """Handle /start command"""
    user = message.from_user
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

Я навигационный бот Президентской Академии.

🗺 Помогу вам найти нужную аудиторию
📅 Покажу программу мероприятий
📝 Запишу на интересующие события
💬 Отвечу на ваши вопросы

Нажмите кнопку ниже, чтобы открыть приложение:
"""
    
    await message.answer(
        welcome_text,
        reply_markup=get_webapp_keyboard()
    )


@router.message(Command("help"))
async def cmd_help(message: types.Message):
    """Handle /help command"""
    help_text = """
📖 **Справка по боту**

**Доступные команды:**
/start - Начать работу с ботом
/app - Открыть приложение
/help - Показать справку

**Возможности приложения:**
• 📅 Просмотр программы мероприятий
• 🗺 Интерактивная карта Академии
• 📝 Запись на события и воркшопы
• 👤 Информация о спикерах
• 💬 AI-ассистент для ответов на вопросы

Нажмите кнопку ниже, чтобы открыть приложение:
"""
    
    await message.answer(
        help_text,
        reply_markup=get_webapp_keyboard(),
        parse_mode="Markdown"
    )


@router.message(Command("app"))
async def cmd_app(message: types.Message):
    """Handle /app command"""
    await message.answer(
        "🚀 Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=get_webapp_keyboard()
    )


@router.message(F.web_app_data)
async def handle_webapp_data(message: types.Message):
    """Handle data from WebApp"""
    # This handler receives data sent from the Mini App
    data = message.web_app_data.data
    
    # Process the data (e.g., registration confirmation, etc.)
    await message.answer(
        "✅ Данные получены! Спасибо за использование приложения.",
        reply_markup=get_main_keyboard()
    )


@router.callback_query(F.data == "open_app")
async def callback_open_app(callback: types.CallbackQuery):
    """Handle open app button callback"""
    await callback.answer()
    await callback.message.answer(
        "🚀 Нажмите кнопку ниже:",
        reply_markup=get_webapp_keyboard()
    )


@router.message()
async def handle_message(message: types.Message):
    """Handle any other message"""
    await message.answer(
        "Используйте команду /start для начала работы или откройте приложение:",
        reply_markup=get_webapp_keyboard()
    )
