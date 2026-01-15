import hashlib
import hmac
import json
from urllib.parse import parse_qsl, unquote
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.config import settings


def validate_telegram_init_data(init_data: str) -> Optional[dict]:
    """
    Validate Telegram WebApp init data.
    
    Args:
        init_data: The init data string from Telegram WebApp
        
    Returns:
        Parsed user data if valid, None otherwise
    """
    try:
        # Parse init data
        parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))
        
        if "hash" not in parsed_data:
            return None
        
        received_hash = parsed_data.pop("hash")
        
        # Create data check string
        data_check_arr = []
        for key in sorted(parsed_data.keys()):
            data_check_arr.append(f"{key}={parsed_data[key]}")
        data_check_string = "\n".join(data_check_arr)
        
        # Calculate secret key
        secret_key = hmac.new(
            b"WebAppData",
            settings.TELEGRAM_BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Validate hash
        if calculated_hash != received_hash:
            return None
        
        # Check auth_date (not older than 24 hours)
        auth_date = int(parsed_data.get("auth_date", 0))
        auth_datetime = datetime.fromtimestamp(auth_date, tz=timezone.utc)
        if datetime.now(timezone.utc) - auth_datetime > timedelta(hours=24):
            return None
        
        # Parse user data
        user_data = parsed_data.get("user")
        if user_data:
            return json.loads(unquote(user_data))
        
        return None
        
    except Exception:
        return None


def extract_telegram_user(init_data: str) -> Optional[dict]:
    """
    Extract user info from Telegram init data without full validation.
    Useful for development/testing.
    
    Args:
        init_data: The init data string from Telegram WebApp
        
    Returns:
        Parsed user data if present, None otherwise
    """
    try:
        parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))
        user_data = parsed_data.get("user")
        if user_data:
            return json.loads(unquote(user_data))
        return None
    except Exception:
        return None
