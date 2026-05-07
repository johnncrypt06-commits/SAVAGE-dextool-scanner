from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..deps import get_current_user
from ..models import UserSettings, TokenBlacklist, UserWallet
from ..schemas import UserSettingsResponse, UpdateSettingsRequest, BlacklistAddRequest, AutoTradeRequest
from ._utils import get_effective_settings

router = APIRouter()


def validate(data: dict):
    for key in ['tp1_percent', 'tp1_sell_percent', 'tp2_percent', 'trailing_sl_percent', 'daily_loss_limit_percent']:
        if data.get(key) is not None and not (0 <= data[key] <= 1000):
            raise HTTPException(status_code=422, detail=f'{key} out of range')
    if data.get('max_positions') is not None and not (1 <= data['max_positions'] <= 50):
        raise HTTPException(status_code=422, detail='max_positions out of range')


@router.get('', response_model=UserSettingsResponse)
async def get_settings(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    settings = await get_effective_settings(db, user['user_id'])
    wallet = await db.get(UserWallet, user['user_id'])
    if user['is_admin']:
        bl_stmt = select(TokenBlacklist).order_by(TokenBlacklist.added_at.desc())
    else:
        bl_stmt = select(TokenBlacklist).where(TokenBlacklist.added_by == user['user_id']).order_by(TokenBlacklist.added_at.desc())
    blacklist = (await db.execute(bl_stmt)).scalars().all()
    return UserSettingsResponse(**settings, auto_trade=bool(wallet.auto_trade) if wallet else False, blacklist=[{'token_address': b.token_address, 'chain': b.chain, 'reason': b.reason, 'added_by': b.added_by, 'added_at': b.added_at} for b in blacklist])


@router.put('', response_model=UserSettingsResponse)
async def update_settings(payload: UpdateSettingsRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True)
    validate(data)
    settings = await db.get(UserSettings, user['user_id']) or UserSettings(user_id=user['user_id'])
    for key, value in data.items():
        setattr(settings, key, value)
    db.add(settings)
    await db.commit()
    return await get_settings(user, db)


@router.post('/blacklist')
async def add_blacklist(payload: BlacklistAddRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = TokenBlacklist(token_address=payload.token_address, chain=payload.chain, reason=payload.reason, added_by=user['user_id'])
    db.add(item)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=409, detail='Token already blacklisted')
    return {'success': True}


@router.delete('/blacklist/{token_address}')
async def remove_blacklist(token_address: str, chain: str = 'SOL', added_by: int | None = Query(default=None), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user['is_admin']:
        if added_by is not None:
            stmt = select(TokenBlacklist).where(TokenBlacklist.token_address == token_address, TokenBlacklist.chain == chain, TokenBlacklist.added_by == added_by)
        else:
            stmt = select(TokenBlacklist).where(TokenBlacklist.token_address == token_address, TokenBlacklist.chain == chain)
    else:
        stmt = select(TokenBlacklist).where(TokenBlacklist.token_address == token_address, TokenBlacklist.chain == chain, TokenBlacklist.added_by == user['user_id'])
    items = (await db.execute(stmt)).scalars().all()
    if not items:
        raise HTTPException(status_code=404, detail='Not found')
    for item in items:
        await db.delete(item)
    await db.commit()
    return {'success': True}


@router.put('/auto-trade')
async def auto_trade(payload: AutoTradeRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wallet = await db.get(UserWallet, user['user_id'])
    if not wallet:
        raise HTTPException(status_code=404, detail='Wallet not found')
    wallet.auto_trade = 1 if payload.enabled else 0
    await db.commit()
    return {'success': True, 'enabled': payload.enabled}
