import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, TrendingUp, Activity, ShieldCheck, ShieldOff } from 'lucide-react';
import Card from '../components/ui/Card';
import PnlText from '../components/ui/PnlText';
import Toggle from '../components/ui/Toggle';
import { useOverview } from '../api/hooks';
import { useToggleAutoTrade } from '../api/hooks';
import { formatSol, formatUsd, formatPercent } from '../utils/format';
import { APP_NAME } from '../utils/constants';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Overview() {
  useEffect(() => { document.title = `${APP_NAME} — Overview`; }, []);

  const { data, isLoading } = useOverview();
  const toggleAutoTrade = useToggleAutoTrade();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><Skeleton className="h-20 w-full" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card glow>
          <div className="flex items-start justify-between">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Portfolio Value</p>
            <TrendingUp size={16} className="text-green" />
          </div>
          <p className="text-2xl font-mono font-bold mt-2 text-text-primary">{formatSol(data.total_value_sol)}</p>
          <p className="text-sm text-text-secondary mt-1">{formatUsd(data.total_value_usd)}</p>
        </Card>

        <Card glow>
          <div className="flex items-start justify-between">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Today's PnL</p>
            <Activity size={16} className={data.today_pnl_percent >= 0 ? 'text-green' : 'text-red'} />
          </div>
          <div className="mt-2">
            <PnlText value={data.today_pnl_percent} className="text-2xl font-bold" />
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {data.today_pnl_usd >= 0 ? '+' : ''}{formatUsd(data.today_pnl_usd)}
          </p>
        </Card>

        <Card glow>
          <div className="flex items-start justify-between">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Win Rate</p>
            <Crosshair size={16} className="text-cyan" />
          </div>
          <p className="text-2xl font-mono font-bold mt-2 text-text-primary">{formatPercent(data.win_rate).replace('+', '')}</p>
          <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all duration-500"
              style={{ width: `${Math.min(data.win_rate, 100)}%` }}
            />
          </div>
        </Card>

        <Card glow>
          <Link to="/positions" className="block">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Active Positions</p>
            <p className="text-2xl font-mono font-bold mt-2 text-text-primary">{data.active_positions}</p>
            <p className="text-xs text-cyan mt-2 hover:underline">View positions →</p>
          </Link>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Kill Switch</p>
            {data.kill_switch_active ? (
              <ShieldOff size={16} className="text-red" />
            ) : (
              <ShieldCheck size={16} className="text-green" />
            )}
          </div>
          <div className="mt-3">
            {data.kill_switch_active ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red/15 text-red">
                TRIGGERED
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green/15 text-green">
                ACTIVE
              </span>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Auto-Trade</p>
              <p className="text-sm text-text-primary mt-2">
                {data.auto_trade_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Toggle
              enabled={data.auto_trade_enabled}
              onChange={(v) => toggleAutoTrade.mutate(v)}
              disabled={toggleAutoTrade.isPending}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
