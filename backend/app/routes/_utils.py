import httpx
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import RPC_URL_SOL
from ..models import UserSettings


async def fetch_sol_balance(address: str) -> float:
    if not address:
        return 0.0
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(RPC_URL_SOL, json={'jsonrpc': '2.0', 'id': 1, 'method': 'getBalance', 'params': [address]})
            resp.raise_for_status()
            return float(resp.json().get('result', {}).get('value', 0)) / 1_000_000_000
    except Exception:
        return 0.0


async def fetch_sol_usd() -> float:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get('https://api.coingecko.com/api/v3/simple/price', params={'ids': 'solana', 'vs_currencies': 'usd'})
            resp.raise_for_status()
            return float(resp.json().get('solana', {}).get('usd', 0))
    except Exception:
        return 0.0


async def get_effective_settings(db: AsyncSession, user_id: int) -> dict:
    settings = await db.get(UserSettings, user_id)
    data = {
        'tp1_percent': 50.0,
        'tp1_sell_percent': 50.0,
        'tp2_percent': 100.0,
        'trailing_sl_percent': 15.0,
        'daily_loss_limit_percent': 20.0,
        'max_positions': 3,
        'stop_loss': -30,
        'slippage': 15,
        'capital_per_trade': 'percent:50',
    }
    if settings:
        for key in data:
            val = getattr(settings, key, None)
            if val is not None:
                data[key] = val
    return data
