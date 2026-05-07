from fastapi import Request, HTTPException, Depends
from .auth import decode_jwt
from .database import get_db


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get('auth_token')
    if not token:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail='Invalid or expired token')
    return {'user_id': int(payload['sub']), 'username': payload.get('username', ''), 'is_admin': payload.get('is_admin', False)}


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user['is_admin']:
        raise HTTPException(status_code=403, detail='Admin access required')
    return user
