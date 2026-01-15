from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Header, Body
from jose import jwt, JWTError

from app.config import settings

router = APIRouter()

ALGORITHM = "HS256"
BEARER_PREFIX = "Bearer "


def create_admin_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ADMIN_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": username, "type": "admin", "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_admin_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        username = payload.get("sub")
        if not username or username != settings.ADMIN_USERNAME:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_current_admin_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith(BEARER_PREFIX):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    token = authorization[len(BEARER_PREFIX):]
    return verify_admin_token(token)


@router.post("/login")
async def admin_login(
    username: str = Body(..., embed=True),
    password: str = Body(..., embed=True)
):
    if username != settings.ADMIN_USERNAME or password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_admin_token(username)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
async def admin_me(current: str = Depends(get_current_admin_token)):
    return {"username": current}
