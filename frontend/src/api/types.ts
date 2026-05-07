export interface TelegramLoginData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface UserInfo {
  user_id: number;
  username: string;
  is_admin: boolean;
}

export interface OverviewResponse {
  total_value_sol: number;
  total_value_usd: number;
  today_pnl_percent: number;
  today_pnl_usd: number;
  win_rate: number;
  active_positions: number;
  kill_switch_active: boolean;
  auto_trade_enabled: boolean;
}

export interface PositionResponse {
  id: number;
  token_symbol: string;
  token_address: string;
  chain: string;
  entry_price: number;
  current_price: number;
  unrealised_pnl_percent: number;
  tokens_received: number;
  buy_amount_native: number;
  tp1_level: number | null;
  tp2_level: number | null;
  trailing_sl_level: number | null;
  tp1_hit: boolean;
  opened_at: string;
}

export interface TradeResponse {
  id: number;
  token_symbol: string;
  token_address: string;
  entry_price: number;
  exit_price: number;
  roi_percent: number;
  buy_amount_native: number;
  sell_amount_native: number;
  profit_usd: number | null;
  close_reason: string | null;
  opened_at: string;
  closed_at: string;
  duration_seconds: number | null;
}

export interface PerformanceResponse {
  total_trades: number;
  win_rate: number;
  avg_roi: number;
  best_trade_roi: number;
  worst_trade_roi: number;
  cumulative_pnl_native: number;
  chart_data: Array<{ date: string; cumulative_pnl: number }>;
}

export interface UserSettingsResponse {
  capital_per_trade: string | null;
  tp1_percent: number | null;
  tp1_sell_percent: number | null;
  tp2_percent: number | null;
  trailing_sl_percent: number | null;
  max_positions: number | null;
  daily_loss_limit_percent: number | null;
  auto_trade: boolean;
  stop_loss: number | null;
  slippage: number | null;
  blacklist: Array<{ token_address: string; chain: string; reason: string; added_by: number; added_at: string }>;
}

export interface UpdateSettingsRequest {
  capital_per_trade: string | null;
  tp1_percent: number | null;
  tp1_sell_percent: number | null;
  tp2_percent: number | null;
  trailing_sl_percent: number | null;
  max_positions: number | null;
  daily_loss_limit_percent: number | null;
  stop_loss: number | null;
  slippage: number | null;
}

export interface WalletResponse {
  address: string;
  balance_sol: number;
  balance_usd: number;
}

export interface WsEvent {
  type: 'price_update' | 'position_update' | 'trade_closed' | 'kill_switch_triggered' | 'new_token_detected';
  data: unknown;
}
