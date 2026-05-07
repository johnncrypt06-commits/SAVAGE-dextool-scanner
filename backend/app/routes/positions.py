import os
import sys
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..deps import get_current_user
from ..models import OpenPosition, CompletedTrade
from ..schemas import PositionResponse, ClosePositionResponse
from ..redis_client import redis_pool
from ..ws_manager import ws_manager
from ._utils import get_effective_settings

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

router = APIRouter()


async def current_price(token_address: str) -> float:
    cached = await redis_pool.get_cached_price(token_address)
    if cached:
        return float(cached.get('price') or cached.get('price_usd') or 0)
    return 0.0


@router.get('', response_model=list[PositionResponse])
async def positions(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(OpenPosition).order_by(OpenPosition.opened_at.desc())
    if not user['is_admin']:
        stmt = stmt.where(OpenPosition.user_id == user['user_id'])
    rows = (await db.execute(stmt)).scalars().all()
    out = []
    for p in rows:
        settings = await get_effective_settings(db, p.user_id)
        price = await current_price(p.token_address) or p.entry_price
        pnl = ((price - p.entry_price) / p.entry_price * 100) if p.entry_price else 0
        peak = p.peak_price or max(p.entry_price, price)
        out.append(PositionResponse(
            id=p.id, token_symbol=p.token_symbol, token_address=p.token_address, chain=p.chain,
            entry_price=p.entry_price, current_price=price, unrealised_pnl_percent=pnl,
            tokens_received=p.tokens_received, buy_amount_native=p.buy_amount_native,
            tp1_level=p.entry_price * (1 + settings['tp1_percent'] / 100) if settings.get('tp1_percent') is not None else None,
            tp2_level=p.entry_price * (1 + settings['tp2_percent'] / 100) if settings.get('tp2_percent') is not None else None,
            trailing_sl_level=peak * (1 - settings['trailing_sl_percent'] / 100) if settings.get('trailing_sl_percent') is not None else None,
            tp1_hit=bool(p.tp1_hit), opened_at=p.opened_at,
        ))
    return out


@router.post('/{position_id}/close', response_model=ClosePositionResponse)
async def close_position(position_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pos = await db.get(OpenPosition, position_id)
    if not pos or (not user['is_admin'] and pos.user_id != user['user_id']):
        raise HTTPException(status_code=404, detail='Position not found')
    try:
        from trader import create_user_trader
        trader = await create_user_trader(pos.user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Could not initialise trader: {exc}') from exc
    if trader is None:
        raise HTTPException(status_code=404, detail='Wallet not found')
    try:
        if pos.chain.upper() == 'SOL':
            ui_balance, decimals = await trader.get_token_balance(pos.token_address)
            tokens_raw = int(ui_balance * (10 ** decimals)) if decimals > 0 else int(ui_balance * 1_000_000_000)
            sell_result = await trader.sell_token(pos.token_address, tokens_raw, decimals)
        else:
            ui_balance, decimals = await trader.get_token_balance(pos.token_address, pos.chain)
            tokens_raw = int(ui_balance * (10 ** decimals))
            sell_result = await trader.sell_token(pos.token_address, pos.chain, tokens_raw, decimals)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Sell failed: {exc}') from exc
    if not sell_result:
        raise HTTPException(status_code=500, detail='Sell failed')
    price = float(sell_result.get('exit_price') or await current_price(pos.token_address) or pos.entry_price)
    roi = ((price - pos.entry_price) / pos.entry_price * 100) if pos.entry_price else 0
    sell_amount = float(sell_result.get('native_received') or pos.buy_amount_native * (1 + roi / 100))
    trade = CompletedTrade(
        token_address=pos.token_address, token_symbol=pos.token_symbol, chain=pos.chain,
        entry_price=pos.entry_price, exit_price=price, tokens_amount=pos.tokens_received,
        buy_amount_native=pos.buy_amount_native, sell_amount_native=sell_amount,
        profit_usd=None, roi_percent=roi, buy_tx_hash=pos.buy_tx_hash, sell_tx_hash=sell_result.get('tx_hash', ''),
        opened_at=pos.opened_at, duration_seconds=int((datetime.now(timezone.utc) - pos.opened_at).total_seconds()) if pos.opened_at else None,
        user_id=pos.user_id, close_reason='manual',
    )
    db.add(trade)
    await db.delete(pos)
    await db.commit()
    await ws_manager.send_to_user(pos.user_id, 'trade_closed', {'position_id': position_id, 'roi_percent': roi})
    return ClosePositionResponse(success=True, tx_hash=sell_result.get('tx_hash', ''), exit_price=price, roi_percent=roi)
