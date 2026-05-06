from datetime import datetime
from sqlalchemy import Integer, BigInteger, String, Float, Boolean, DateTime, Text, UniqueConstraint, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class DetectedToken(Base):
    __tablename__ = 'detected_tokens'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    contract_address: Mapped[str] = mapped_column(String(255), nullable=False)
    chain: Mapped[str] = mapped_column(String(10), nullable=False)
    market_cap: Mapped[float | None] = mapped_column(Float, nullable=True)
    liquidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_native: Mapped[float | None] = mapped_column(Float, nullable=True)
    volume_24h: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_change_24h: Mapped[float | None] = mapped_column(Float, nullable=True)
    holders: Mapped[int | None] = mapped_column(Integer, nullable=True)
    buy_tax: Mapped[float | None] = mapped_column(Float, nullable=True)
    sell_tax: Mapped[float | None] = mapped_column(Float, nullable=True)
    dextools_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    dex_pair_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    deployer_wallet: Mapped[str | None] = mapped_column(String(255), nullable=True)
    social_links: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint('contract_address', 'chain'),)


class OpenPosition(Base):
    __tablename__ = 'open_positions'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    token_symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    chain: Mapped[str] = mapped_column(String(10), nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    tokens_received: Mapped[float] = mapped_column(Float, nullable=False)
    buy_amount_native: Mapped[float] = mapped_column(Float, nullable=False)
    buy_tx_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    pair_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    peak_price: Mapped[float] = mapped_column(Float, default=0)
    trailing_activated: Mapped[int] = mapped_column(Integer, default=0)
    entry_liquidity: Mapped[float] = mapped_column(Float, default=0)
    user_id: Mapped[int] = mapped_column(BigInteger, default=0)
    tiers_completed: Mapped[str] = mapped_column(Text, default='[]')
    tp1_hit: Mapped[bool] = mapped_column(Boolean, default=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint('token_address', 'chain', 'user_id'),)


class CompletedTrade(Base):
    __tablename__ = 'completed_trades'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    token_symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    chain: Mapped[str] = mapped_column(String(10), nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    exit_price: Mapped[float] = mapped_column(Float, nullable=False)
    tokens_amount: Mapped[float] = mapped_column(Float, nullable=False)
    buy_amount_native: Mapped[float] = mapped_column(Float, nullable=False)
    sell_amount_native: Mapped[float] = mapped_column(Float, nullable=False)
    profit_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    roi_percent: Mapped[float] = mapped_column(Float, nullable=False)
    buy_tx_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    sell_tx_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    closed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int] = mapped_column(BigInteger, default=0)
    close_reason: Mapped[str | None] = mapped_column(String(20), nullable=True)


class AllowedUser(Base):
    __tablename__ = 'allowed_users'
    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserWallet(Base):
    __tablename__ = 'user_wallets'
    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    public_key: Mapped[str] = mapped_column(String(255), nullable=False)
    encrypted_private_key: Mapped[str] = mapped_column(Text, nullable=False)
    encrypted_seed_phrase: Mapped[str] = mapped_column(Text, default='')
    auto_trade: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserSettings(Base):
    __tablename__ = 'user_settings'
    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    min_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stop_loss: Mapped[int | None] = mapped_column(Integer, nullable=True)
    take_profit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    buy_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    trailing_drop: Mapped[int | None] = mapped_column(Integer, nullable=True)
    slippage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_positions: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_buy_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    compound_enabled: Mapped[int | None] = mapped_column(Integer, nullable=True)
    compound_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tp1_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    tp1_sell_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    tp2_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    trailing_sl_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_loss_limit_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    capital_per_trade: Mapped[str | None] = mapped_column(String(50), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TokenBlacklist(Base):
    __tablename__ = 'token_blacklist'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    chain: Mapped[str] = mapped_column(String(10), default='SOL')
    reason: Mapped[str] = mapped_column(Text, default='')
    added_by: Mapped[int] = mapped_column(BigInteger, nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint('token_address', 'chain'),)


class TokenWhitelist(Base):
    __tablename__ = 'token_whitelist'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    chain: Mapped[str] = mapped_column(String(10), default='SOL')
    label: Mapped[str] = mapped_column(Text, default='')
    added_by: Mapped[int] = mapped_column(BigInteger, nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint('token_address', 'chain'),)


class WhaleWallet(Base):
    __tablename__ = 'whale_wallets'
    address: Mapped[str] = mapped_column(String(255), primary_key=True)
    label: Mapped[str] = mapped_column(Text, default='')
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class WhaleEvent(Base):
    __tablename__ = 'whale_events'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    wallet_address: Mapped[str] = mapped_column(String(255), nullable=False)
    token_mint: Mapped[str] = mapped_column(String(255), nullable=False)
    token_symbol: Mapped[str] = mapped_column(String(50), default='')
    sol_spent: Mapped[float] = mapped_column(Float, nullable=False)
    tokens_received: Mapped[float] = mapped_column(Float, nullable=False)
    tx_signature: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BotChat(Base):
    __tablename__ = 'bot_chats'
    chat_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    chat_type: Mapped[str] = mapped_column(String(20), default='private')
    title: Mapped[str] = mapped_column(String(255), default='')
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ScanHistory(Base):
    __tablename__ = 'scan_history'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    contract_address: Mapped[str] = mapped_column(String(255), nullable=False)
    chain: Mapped[str] = mapped_column(String(10), nullable=False)
    symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    score_breakdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    market_cap: Mapped[float | None] = mapped_column(Float, nullable=True)
    liquidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    volume_24h: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    holders: Mapped[int | None] = mapped_column(Integer, nullable=True)
    buy_tax: Mapped[float | None] = mapped_column(Float, nullable=True)
    sell_tax: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(String(50), default='')
    was_bought: Mapped[int] = mapped_column(Integer, default=0)
    scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SnipeTarget(Base):
    __tablename__ = 'snipe_targets'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(20), default='active')
    buy_tx_hash: Mapped[str] = mapped_column(String(255), default='')
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    filled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    __table_args__ = (UniqueConstraint('token_address', 'user_id'),)


class FeeLedger(Base):
    __tablename__ = 'fee_ledger'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    token_symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    trade_profit_native: Mapped[float] = mapped_column(Float, nullable=False)
    fee_amount_native: Mapped[float] = mapped_column(Float, nullable=False)
    fee_percent: Mapped[float] = mapped_column(Float, nullable=False)
    fee_tx_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='pending')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DcaOrder(Base):
    __tablename__ = 'dca_orders'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    token_symbol: Mapped[str] = mapped_column(String(50), default='')
    chain: Mapped[str] = mapped_column(String(10), default='SOL')
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    amount_per_buy: Mapped[float] = mapped_column(Float, nullable=False)
    splits_total: Mapped[int] = mapped_column(Integer, nullable=False)
    splits_done: Mapped[int] = mapped_column(Integer, default=0)
    interval_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default='active')
    last_buy_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (Index('idx_dca_active_unique', 'user_id', 'token_address', 'chain', unique=True, postgresql_where=(status == 'active')),)


class LimitOrder(Base):
    __tablename__ = 'limit_orders'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    token_address: Mapped[str] = mapped_column(String(255), nullable=False)
    token_symbol: Mapped[str] = mapped_column(String(50), default='')
    chain: Mapped[str] = mapped_column(String(10), default='SOL')
    side: Mapped[str] = mapped_column(String(10), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    target_price: Mapped[float] = mapped_column(Float, nullable=False)
    condition: Mapped[str] = mapped_column(String(10), default='lte')
    status: Mapped[str] = mapped_column(String(20), default='active')
    fill_tx_hash: Mapped[str] = mapped_column(String(255), default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    filled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CompoundFund(Base):
    __tablename__ = 'compound_fund'
    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    available: Mapped[float] = mapped_column(Float, default=0.0)
    total_compounded: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DailyLossRecord(Base):
    __tablename__ = 'daily_loss_records'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    date: Mapped[str] = mapped_column(String(10), nullable=False)
    total_loss: Mapped[float] = mapped_column(Float, default=0.0)
    kill_switch_active: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (UniqueConstraint('user_id', 'date'),)
