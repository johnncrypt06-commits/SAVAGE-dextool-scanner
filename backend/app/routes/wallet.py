from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..deps import get_current_user
from ..models import UserWallet
from ..schemas import WalletResponse
from ._utils import fetch_sol_balance, fetch_sol_usd

router = APIRouter()


@router.get('', response_model=WalletResponse)
async def wallet(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    w = await db.get(UserWallet, user['user_id'])
    if not w:
        raise HTTPException(status_code=404, detail='Wallet not found')
    sol = await fetch_sol_balance(w.public_key)
    usd = await fetch_sol_usd()
    return WalletResponse(address=w.public_key, balance_sol=sol, balance_usd=sol * usd, qr_code_data=w.public_key)
