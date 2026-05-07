import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../components/ui/Card';
import CopyButton from '../components/ui/CopyButton';
import { useWallet } from '../api/hooks';
import { formatSol, formatUsd } from '../utils/format';
import { APP_NAME } from '../utils/constants';
import { AlertTriangle, Wallet as WalletIcon } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Wallet() {
  useEffect(() => { document.title = `${APP_NAME} — Wallet`; }, []);

  const { data, isLoading } = useWallet();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center pt-12">
        <Card className="w-full max-w-md">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4 md:pt-12">
      <Card glow className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center">
            <WalletIcon size={24} className="text-green" />
          </div>
        </div>

        <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Wallet Address</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <code className="text-sm font-mono text-text-primary break-all">{data.address}</code>
          <CopyButton text={data.address} />
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={data.address} size={160} level="M" />
          </div>
        </div>

        <p className="text-3xl font-mono font-bold text-text-primary">{formatSol(data.balance_sol)}</p>
        <p className="text-sm text-text-secondary mt-1">{formatUsd(data.balance_usd)}</p>

        <div className="mt-8 bg-cyan/5 border border-cyan/20 rounded-lg p-4 text-left">
          <p className="text-xs text-cyan font-medium mb-1">Top-up Instructions</p>
          <p className="text-xs text-text-secondary">
            Send SOL to this address to fund your trading wallet.
          </p>
        </div>

        <div className="mt-4 bg-yellow/5 border border-yellow/20 rounded-lg p-4 text-left flex items-start gap-2">
          <AlertTriangle size={14} className="text-yellow mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary">
            Never share your private key. The dashboard never exposes private keys.
          </p>
        </div>
      </Card>
    </div>
  );
}
