from fastapi import APIRouter
from . import auth, overview, positions, trades, performance, settings, wallet, websocket

router = APIRouter()
router.include_router(auth.router, prefix='/auth', tags=['auth'])
router.include_router(overview.router, tags=['overview'])
router.include_router(positions.router, prefix='/positions', tags=['positions'])
router.include_router(trades.router, prefix='/trades', tags=['trades'])
router.include_router(performance.router, prefix='/performance', tags=['performance'])
router.include_router(settings.router, prefix='/settings', tags=['settings'])
router.include_router(wallet.router, prefix='/wallet', tags=['wallet'])
router.include_router(websocket.router, tags=['websocket'])
