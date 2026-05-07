import { useEffect, useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PnlText from '../components/ui/PnlText';
import { useTrades } from '../api/hooks';
import { api } from '../api/client';
import { formatNumber, formatDuration, formatDate } from '../utils/format';
import { CLOSE_REASON_COLORS } from '../utils/constants';
import type { TradeResponse } from '../api/types';
import { APP_NAME } from '../utils/constants';
import { Download } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function TradeHistory() {
  useEffect(() => { document.title = `${APP_NAME} — Trade History`; }, []);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortKey, setSortKey] = useState('closed_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useTrades(page, perPage, sortKey, sortDir);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  }, [sortKey]);

  const totalPages = data ? Math.ceil(data.total / perPage) : 0;

  const reasonBadge = (reason: string | null) => {
    if (!reason) return <Badge variant="muted">-</Badge>;
    const style = CLOSE_REASON_COLORS[reason] || CLOSE_REASON_COLORS.Manual;
    const variant = reason === 'TP1' ? 'green' : reason === 'TP2' ? 'cyan' : reason === 'SL' ? 'red'
      : reason === 'Trailing SL' ? 'yellow' : reason === 'Anti-Rug' ? 'yellow' : 'muted';
    return <Badge variant={variant}>{reason}</Badge>;
  };

  const columns: Column<TradeResponse>[] = [
    {
      key: 'token',
      header: 'Token',
      render: (row) => <span className="font-medium text-text-primary">{row.token_symbol}</span>,
    },
    {
      key: 'price',
      header: 'Entry → Exit',
      render: (row) => (
        <span className="font-mono text-xs text-text-secondary">
          {formatNumber(row.entry_price)} → {formatNumber(row.exit_price)}
        </span>
      ),
    },
    {
      key: 'roi_percent',
      header: 'PnL %',
      sortable: true,
      render: (row) => <PnlText value={row.roi_percent} />,
    },
    {
      key: 'profit',
      header: 'Profit',
      render: (row) => (
        <span className={`font-mono text-sm ${(row.sell_amount_native - row.buy_amount_native) >= 0 ? 'text-green' : 'text-red'}`}>
          {(row.sell_amount_native - row.buy_amount_native).toFixed(4)} SOL
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row) => <span className="text-xs text-text-secondary">{formatDuration(row.duration_seconds)}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => reasonBadge(row.close_reason),
    },
    {
      key: 'closed_at',
      header: 'Date',
      sortable: true,
      render: (row) => <span className="text-xs text-text-secondary">{formatDate(row.closed_at)}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <Card>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <a href={api.exportTrades()} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Download size={14} />
            Export CSV
          </Button>
        </a>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={data?.items ?? []}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          emptyMessage="No trades yet"
        />
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Rows:</span>
          {[10, 20, 50].map((n) => (
            <button
              key={n}
              onClick={() => { setPerPage(n); setPage(1); }}
              className={`px-2 py-1 text-xs rounded cursor-pointer ${
                perPage === n ? 'bg-green/15 text-green' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-xs text-text-secondary">
            {page} / {totalPages || 1}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
