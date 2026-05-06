import csv
import io
from fastapi import APIRouter, Depends, Response, Query
from sqlalchemy import select, func, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..deps import get_current_user
from ..models import CompletedTrade
from ..schemas import TradesPage

router = APIRouter()
SORT_COLUMNS = {'id': CompletedTrade.id, 'roi_percent': CompletedTrade.roi_percent, 'closed_at': CompletedTrade.closed_at, 'token_symbol': CompletedTrade.token_symbol}


@router.get('', response_model=TradesPage)
async def trades(page: int = 1, per_page: int = 25, sort_by: str = 'closed_at', sort_order: str = 'desc', user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    page = max(page, 1)
    per_page = min(max(per_page, 1), 100)
    filters = [] if user['is_admin'] else [CompletedTrade.user_id == user['user_id']]
    total = await db.scalar(select(func.count()).select_from(CompletedTrade).where(*filters)) or 0
    col = SORT_COLUMNS.get(sort_by, CompletedTrade.closed_at)
    order = asc(col) if sort_order == 'asc' else desc(col)
    rows = (await db.execute(select(CompletedTrade).where(*filters).order_by(order).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {'page': page, 'per_page': per_page, 'total': total, 'items': rows}


@router.get('/export')
async def export_trades(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    filters = [] if user['is_admin'] else [CompletedTrade.user_id == user['user_id']]
    rows = (await db.execute(select(CompletedTrade).where(*filters).order_by(CompletedTrade.closed_at.desc()))).scalars().all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(['id', 'token_symbol', 'token_address', 'chain', 'entry_price', 'exit_price', 'tokens_amount', 'buy_amount_native', 'sell_amount_native', 'profit_usd', 'roi_percent', 'buy_tx_hash', 'sell_tx_hash', 'opened_at', 'closed_at', 'duration_seconds', 'user_id', 'close_reason'])
    for r in rows:
        writer.writerow([r.id, r.token_symbol, r.token_address, r.chain, r.entry_price, r.exit_price, r.tokens_amount, r.buy_amount_native, r.sell_amount_native, r.profit_usd, r.roi_percent, r.buy_tx_hash, r.sell_tx_hash, r.opened_at, r.closed_at, r.duration_seconds, r.user_id, r.close_reason])
    return Response(buf.getvalue(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename=trades.csv'})
