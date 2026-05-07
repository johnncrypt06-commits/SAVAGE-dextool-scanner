import hashlib
import hmac
import time
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from .config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS, TELEGRAM_BOT_TOKEN, ADMIN_TELEGRAM_IDS


def verify_telegram_login(data: dict) -> bool:
    check_hash = data.get('hash', '')
    auth_date = int(data.get('auth_date', 0))
    if not TELEGRAM_BOT_TOKEN or not check_hash or time.time() - auth_date > 86400:
        return False
    filtered = {k: v for k, v in data.items() if k != 'hash' and v is not None}
    check_string = '\n'.join(f'{k}={v}' for k, v in sorted(filtered.items()))
    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    computed = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, check_hash)


def create_jwt(user_id: int, username: str = '', is_admin: bool = False) -> str:
    now = datetime.now(timezone.utc)
    payload = {'sub': str(user_id), 'username': username, 'is_admin': is_admin, 'exp': now + timedelta(hours=JWT_EXPIRE_HOURS), 'iat': now}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_TELEGRAM_IDS
