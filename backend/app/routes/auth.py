from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import AllowedUser
from ..schemas import TelegramLoginData, UserInfo
from ..auth import verify_telegram_login, create_jwt, is_admin
from ..deps import get_current_user

router = APIRouter()


@router.post('/telegram', response_model=UserInfo)
async def telegram_login(payload: TelegramLoginData, response: Response, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    if not verify_telegram_login(data):
        raise HTTPException(status_code=401, detail='Invalid Telegram login signature')
    allowed = await db.get(AllowedUser, payload.id)
    if not allowed:
        raise HTTPException(status_code=403, detail='User is not allowed. Contact admin.')
    username = payload.username or allowed.username or ''
    admin = is_admin(payload.id)
    token = create_jwt(payload.id, username, admin)
    response.set_cookie('auth_token', token, httponly=True, samesite='lax', max_age=72 * 3600, secure=False)
    return UserInfo(user_id=payload.id, username=username, is_admin=admin)


@router.get('/me', response_model=UserInfo)
async def me(user: dict = Depends(get_current_user)):
    return UserInfo(**user)


@router.post('/logout')
async def logout(response: Response):
    response.delete_cookie('auth_token')
    return {'success': True}
