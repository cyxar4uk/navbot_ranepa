"""
Telegram WebApp integration utilities
"""
from typing import Optional
import json
from aiogram import types

from app.config import settings


def create_webapp_data(data: dict) -> str:
    """Create data string to send to WebApp"""
    return json.dumps(data)


def parse_webapp_data(data: str) -> Optional[dict]:
    """Parse data received from WebApp"""
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return None


def get_webapp_url(path: str = "", params: dict = None) -> str:
    """
    Get WebApp URL with optional path and parameters.
    
    Args:
        path: Additional path to append to base URL
        params: Query parameters to add
        
    Returns:
        Full WebApp URL
    """
    base_url = settings.TELEGRAM_WEBAPP_URL.rstrip("/")
    
    if path:
        base_url = f"{base_url}/{path.lstrip('/')}"
    
    if params:
        param_str = "&".join(f"{k}={v}" for k, v in params.items())
        base_url = f"{base_url}?{param_str}"
    
    return base_url


def create_event_deep_link(event_id: str) -> str:
    """Create deep link to specific event in WebApp"""
    return get_webapp_url(params={"event": event_id})


def create_item_deep_link(item_id: str) -> str:
    """Create deep link to specific event item in WebApp"""
    return get_webapp_url(params={"item": item_id})


def create_map_deep_link(location_id: str = None) -> str:
    """Create deep link to map view in WebApp"""
    params = {"view": "map"}
    if location_id:
        params["location"] = location_id
    return get_webapp_url(params=params)
