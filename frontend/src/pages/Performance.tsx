import { useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Card from '../components/ui/Card';
import PnlText from '../components/ui/PnlText';
import { usePerformance } from '../api/hooks';
import { formatPercent } from '../utils/format';
import { APP_NAME } from '../utils/constants';
import { TrendingUp, TrendingDown, BarChart3, Target, Zap } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Performance() {
  useEffect(() => { document.title = `${APP_NAME} — Performance`; }, []);

  const { data, isLoading } = usePerformance();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Performance</h1>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><Skeleton className="h-16 w-full" /></Card>
          ))}
        </div>
        <Card><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Performance</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-cyan" />
            <p className="text-xs text-text-secondary uppercase tracking-wider">Total Trades</p>
          </div>
          <p className="text-xl font-mono font-bold">{data.total_trades}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-green" />
            <p className="text-xs text-text-secondary uppercase tracking-wider">Win Rate</p>
          </div>
          <p className={`text-xl font-mono font-bold ${data.win_rate >= 50 ? 'text-green' : 'text-red'}`}>
            {data.win_rate.toFixed(1)}%
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-yellow" />
            <p className="text-xs text-text-secondary uppercase tracking-wider">Avg ROI</p>
          </div>
          <PnlText value={data.avg_roi} className="text-xl font-bold" />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green" />
            <p className="text-xs text-text-secondary uppercase tracking-wider">Best Trade</p>
          </div>
          <PnlText value={data.best_trade_roi} className="text-xl font-bold" />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-red" />
            <p className="text-xs text-text-secondary uppercase tracking-wider">Worst Trade</p>
          </div>
          <PnlText value={data.worst_trade_roi} className="text-xl font-bold" />
        </Card>
      </div>

      <Card>
        <p className="text-sm text-text-secondary mb-4">Cumulative PnL (SOL)</p>
        {data.chart_data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data.chart_data}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E1E2E" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8888A0', fontSize: 11 }}
                axisLine={{ stroke: '#1E1E2E' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8888A0', fontSize: 11 }}
                axisLine={{ stroke: '#1E1E2E' }}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#12121A',
                  border: '1px solid #1E1E2E',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#E8E8F0',
                }}
                labelStyle={{ color: '#8888A0' }}
                formatter={(value: number) => [`${value.toFixed(4)} SOL`, 'PnL']}
              />
              <Area
                type="monotone"
                dataKey="cumulative_pnl"
                stroke="#00FF88"
                strokeWidth={2}
                fill="url(#pnlGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">
            No chart data available
          </div>
        )}
      </Card>
    </div>
  );
}
