import logging
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import AllowedUser
from ..schemas import TelegramLoginData, UserInfo
from ..auth import verify_telegram_login, create_jwt, is_admin
from ..deps import get_current_user
from ..config import FRONTEND_URL, TELEGRAM_BOT_TOKEN

router = APIRouter()
logger = logging.getLogger(__name__)
LOCAL_FRONTEND = FRONTEND_URL.startswith(('http://localhost', 'http://127.0.0.1'))
COOKIE_SECURE = not LOCAL_FRONTEND
COOKIE_SAMESITE = 'lax' if LOCAL_FRONTEND else 'none'


async def _send_login_confirmation(user_id: int) -> None:
    if not TELEGRAM_BOT_TOKEN:
        return
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage',
                json={'chat_id': user_id, 'text': '✅ Älpha dashboard login confirmed.'},
            )
    except Exception as exc:
        logger.warning('Telegram login confirmation failed for user %d: %s', user_id, exc)


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
    response.set_cookie(
        'auth_token',
        token,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        max_age=72 * 3600,
        secure=COOKIE_SECURE,
    )
    await _send_login_confirmation(payload.id)
    return UserInfo(user_id=payload.id, username=username, is_admin=admin)


@router.get('/telegram/callback')
async def telegram_login_redirect(
    id: int = Query(...),
    first_name: str = Query(...),
    auth_date: int = Query(...),
    hash: str = Query(...),
    last_name: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    photo_url: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    data = {'id': id, 'first_name': first_name, 'auth_date': auth_date, 'hash': hash}
    if last_name is not None:
        data['last_name'] = last_name
    if username is not None:
        data['username'] = username
    if photo_url is not None:
        data['photo_url'] = photo_url

    if not verify_telegram_login(data):
        logger.warning('Telegram redirect callback: invalid signature for id=%s', id)
        return RedirectResponse(url=f'{FRONTEND_URL}/login?error=invalid', status_code=302)

    allowed = await db.get(AllowedUser, id)
    if not allowed:
        logger.info('Telegram redirect callback: user %s not in allow-list', id)
        return RedirectResponse(url=f'{FRONTEND_URL}/login?error=access_denied', status_code=302)

    username_value = username or allowed.username or ''
    admin = is_admin(id)
    token = create_jwt(id, username_value, admin)

    redirect = RedirectResponse(url=f'{FRONTEND_URL}/overview', status_code=303)
    redirect.set_cookie(
        'auth_token',
        token,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        max_age=72 * 3600,
        secure=COOKIE_SECURE,
    )
    await _send_login_confirmation(id)
    return redirect


@router.get('/me', response_model=UserInfo)
async def me(user: dict = Depends(get_current_user)):
    return UserInfo(**user)


@router.post('/logout')
async def logout(response: Response):
    response.delete_cookie('auth_token', samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    return {'success': True}
