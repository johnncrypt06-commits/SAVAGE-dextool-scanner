from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..deps import get_current_user
from ..models import UserWallet, OpenPosition, CompletedTrade, DailyLossRecord
from ..schemas import OverviewResponse
from ._utils import fetch_sol_balance, fetch_sol_usd

router = APIRouter()


@router.get('/overview', response_model=OverviewResponse)
async def overview(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    filters = [] if user['is_admin'] else [UserWallet.user_id == user['user_id']]
    wallets = (await db.execute(select(UserWallet).where(*filters))).scalars().all()
    balances = [await fetch_sol_balance(w.public_key) for w in wallets]
    total_sol = sum(balances)
    sol_usd = await fetch_sol_usd()
    trade_filters = [] if user['is_admin'] else [CompletedTrade.user_id == user['user_id']]
    today = datetime.now(timezone.utc).date()
    today_trades = (await db.execute(select(CompletedTrade).where(*trade_filters, func.date(CompletedTrade.closed_at) == today))).scalars().all()
    all_trades = (await db.execute(select(CompletedTrade).where(*trade_filters))).scalars().all()
    wins = sum(1 for t in all_trades if t.roi_percent > 0)
    active_positions = await db.scalar(select(func.count()).select_from(OpenPosition).where(*([] if user['is_admin'] else [OpenPosition.user_id == user['user_id']]))) or 0
    kill_filters = [DailyLossRecord.kill_switch_active.is_(True)] if user['is_admin'] else [DailyLossRecord.user_id == user['user_id'], DailyLossRecord.date == today.isoformat()]
    kill = await db.scalar(select(func.count()).select_from(DailyLossRecord).where(*kill_filters)) or 0
    return OverviewResponse(
        total_value_sol=total_sol,
        total_value_usd=total_sol * sol_usd,
        today_pnl_percent=sum(t.roi_percent for t in today_trades),
        today_pnl_usd=sum((t.profit_usd or 0) for t in today_trades),
        win_rate=(wins / len(all_trades) * 100) if all_trades else 0,
        active_positions=active_positions,
        kill_switch_active=kill > 0,
        auto_trade_enabled=any(w.auto_trade for w in wallets),
    )
