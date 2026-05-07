from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..deps import get_current_user
from ..models import CompletedTrade
from ..schemas import PerformanceResponse

router = APIRouter()


@router.get('', response_model=PerformanceResponse)
async def performance(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    filters = [] if user['is_admin'] else [CompletedTrade.user_id == user['user_id']]
    trades = (await db.execute(select(CompletedTrade).where(*filters).order_by(CompletedTrade.closed_at.asc()))).scalars().all()
    total = len(trades)
    wins = sum(1 for t in trades if t.roi_percent > 0)
    cumulative = 0.0
    daily = defaultdict(float)
    for t in trades:
        pnl = (t.sell_amount_native or 0) - (t.buy_amount_native or 0)
        daily[t.closed_at.date().isoformat()] += pnl
    chart = []
    for day in sorted(daily):
        cumulative += daily[day]
        chart.append({'date': day, 'cumulative_pnl': cumulative})
    return PerformanceResponse(
        total_trades=total,
        win_rate=(wins / total * 100) if total else 0,
        avg_roi=(sum(t.roi_percent for t in trades) / total) if total else 0,
        best_trade_roi=max((t.roi_percent for t in trades), default=0),
        worst_trade_roi=min((t.roi_percent for t in trades), default=0),
        cumulative_pnl_native=sum((t.sell_amount_native or 0) - (t.buy_amount_native or 0) for t in trades),
        cumulative_pnl_usd=sum(t.profit_usd or 0 for t in trades),
        chart_data=chart,
    )
