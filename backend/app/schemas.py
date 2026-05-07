from datetime import datetime
from pydantic import BaseModel, Field


class TelegramLoginData(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None
    auth_date: int
    hash: str


class UserInfo(BaseModel):
    user_id: int
    username: str
    is_admin: bool


class OverviewResponse(BaseModel):
    total_value_sol: float
    total_value_usd: float
    today_pnl_percent: float
    today_pnl_usd: float
    win_rate: float
    active_positions: int
    kill_switch_active: bool
    auto_trade_enabled: bool


class PositionResponse(BaseModel):
    id: int
    token_symbol: str
    token_address: str
    chain: str
    entry_price: float
    current_price: float
    unrealised_pnl_percent: float
    tokens_received: float
    buy_amount_native: float
    tp1_level: float | None
    tp2_level: float | None
    trailing_sl_level: float | None
    tp1_hit: bool
    opened_at: datetime


class ClosePositionResponse(BaseModel):
    success: bool
    tx_hash: str | None = None
    exit_price: float | None = None
    roi_percent: float | None = None


class TradeResponse(BaseModel):
    id: int
    token_symbol: str
    token_address: str
    entry_price: float
    exit_price: float
    roi_percent: float
    buy_amount_native: float
    sell_amount_native: float
    profit_usd: float | None
    close_reason: str | None
    opened_at: datetime
    closed_at: datetime
    duration_seconds: int | None


class TradesPage(BaseModel):
    page: int
    per_page: int
    total: int
    items: list[TradeResponse]


class ChartDataPoint(BaseModel):
    date: str
    cumulative_pnl: float


class PerformanceResponse(BaseModel):
    total_trades: int
    win_rate: float
    avg_roi: float
    best_trade_roi: float
    worst_trade_roi: float
    cumulative_pnl_native: float
    cumulative_pnl_usd: float = 0
    chart_data: list[ChartDataPoint]


class UserSettingsResponse(BaseModel):
    capital_per_trade: str | None
    tp1_percent: float | None
    tp1_sell_percent: float | None
    tp2_percent: float | None
    trailing_sl_percent: float | None
    max_positions: int | None
    daily_loss_limit_percent: float | None
    auto_trade: bool
    stop_loss: int | None
    slippage: int | None
    blacklist: list[dict]


class UpdateSettingsRequest(BaseModel):
    capital_per_trade: str | None = None
    tp1_percent: float | None = None
    tp1_sell_percent: float | None = None
    tp2_percent: float | None = None
    trailing_sl_percent: float | None = None
    max_positions: int | None = None
    daily_loss_limit_percent: float | None = None
    stop_loss: int | None = None
    slippage: int | None = None


class WalletResponse(BaseModel):
    address: str
    balance_sol: float
    balance_usd: float
    qr_code_data: str


class BlacklistAddRequest(BaseModel):
    token_address: str
    chain: str = 'SOL'
    reason: str = ''


class AutoTradeRequest(BaseModel):
    enabled: bool
