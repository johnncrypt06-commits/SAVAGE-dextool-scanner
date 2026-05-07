import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PnlText from '../components/ui/PnlText';
import CopyButton from '../components/ui/CopyButton';
import { usePositions, useClosePosition } from '../api/hooks';
import { truncateAddress, formatNumber, formatDurationFromDate } from '../utils/format';
import type { PositionResponse } from '../api/types';
import { APP_NAME } from '../utils/constants';
import { LineChart } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function LivePositions() {
  useEffect(() => { document.title = `${APP_NAME} — Live Positions`; }, []);

  const { data: positions, isLoading } = usePositions();
  const closePosition = useClosePosition();
  const [closeTarget, setCloseTarget] = useState<PositionResponse | null>(null);

  const columns: Column<PositionResponse>[] = [
    {
      key: 'token',
      header: 'Token',
      render: (row) => (
        <div>
          <span className="font-medium text-text-primary">{row.token_symbol}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-text-muted font-mono">{truncateAddress(row.token_address)}</span>
            <CopyButton text={row.token_address} />
          </div>
        </div>
      ),
    },
    {
      key: 'entry_price',
      header: 'Entry Price',
      render: (row) => <span className="font-mono text-text-primary">{formatNumber(row.entry_price)}</span>,
    },
    {
      key: 'current_price',
      header: 'Current Price',
      render: (row) => <span className="font-mono text-text-primary">{formatNumber(row.current_price)}</span>,
    },
    {
      key: 'pnl',
      header: 'PnL %',
      render: (row) => <PnlText value={row.unrealised_pnl_percent} />,
    },
    {
      key: 'tp',
      header: 'TP1 / TP2',
      render: (row) => (
        <span className="text-xs text-text-secondary font-mono">
          {row.tp1_level != null ? formatNumber(row.tp1_level) : '-'} / {row.tp2_level != null ? formatNumber(row.tp2_level) : '-'}
        </span>
      ),
    },
    {
      key: 'trailing_sl',
      header: 'Trailing SL',
      render: (row) => (
        <span className="text-xs font-mono text-text-secondary">
          {row.trailing_sl_level != null ? formatNumber(row.trailing_sl_level) : '-'}
        </span>
      ),
    },
    {
      key: 'tp1_status',
      header: 'TP1',
      render: (row) =>
        row.tp1_hit ? <Badge variant="green">Hit</Badge> : <Badge variant="muted">Pending</Badge>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row) => <span className="text-xs text-text-secondary">{formatDurationFromDate(row.opened_at)}</span>,
    },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button variant="danger" size="sm" onClick={() => setCloseTarget(row)}>
          Close
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Live Positions</h1>
        <Card>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live Positions</h1>

      <Card className="p-0 overflow-hidden">
        {positions && positions.length > 0 ? (
          <Table columns={columns} data={positions} emptyMessage="No open positions" />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <LineChart size={48} className="mb-4 opacity-30" />
            <p className="text-sm">No open positions</p>
          </div>
        )}
      </Card>

      <Modal
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        title="Close Position"
      >
        <p className="text-sm text-text-secondary mb-6">
          Close position in <span className="text-text-primary font-medium">{closeTarget?.token_symbol}</span>?
          This will sell all remaining tokens at market price.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setCloseTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            disabled={closePosition.isPending}
            onClick={async () => {
              if (closeTarget) {
                await closePosition.mutateAsync(closeTarget.id);
                setCloseTarget(null);
              }
            }}
          >
            {closePosition.isPending ? 'Closing...' : 'Confirm Close'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
