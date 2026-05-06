import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CopyButton from '../components/ui/CopyButton';
import { useSettings, useUpdateSettings, useAddBlacklist, useRemoveBlacklist } from '../api/hooks';
import { truncateAddress, formatDate } from '../utils/format';
import { APP_NAME } from '../utils/constants';
import { X } from 'lucide-react';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Settings() {
  useEffect(() => { document.title = `${APP_NAME} — Settings`; }, []);

  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const addBlacklist = useAddBlacklist();
  const removeBlacklist = useRemoveBlacklist();

  const [form, setForm] = useState({
    capital_per_trade: '',
    tp1_percent: '',
    tp1_sell_percent: '',
    tp2_percent: '',
    trailing_sl_percent: '',
    stop_loss: '',
    max_positions: '',
    daily_loss_limit_percent: '',
    slippage: '',
  });

  const [dirty, setDirty] = useState(false);
  const [blAddress, setBlAddress] = useState('');
  const [blReason, setBlReason] = useState('');

  useEffect(() => {
    if (settings) {
      setForm({
        capital_per_trade: settings.capital_per_trade ?? '',
        tp1_percent: settings.tp1_percent?.toString() ?? '',
        tp1_sell_percent: settings.tp1_sell_percent?.toString() ?? '',
        tp2_percent: settings.tp2_percent?.toString() ?? '',
        trailing_sl_percent: settings.trailing_sl_percent?.toString() ?? '',
        stop_loss: settings.stop_loss?.toString() ?? '',
        max_positions: settings.max_positions?.toString() ?? '',
        daily_loss_limit_percent: settings.daily_loss_limit_percent?.toString() ?? '',
        slippage: settings.slippage?.toString() ?? '',
      });
      setDirty(false);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    const toNum = (v: string) => v === '' ? null : Number(v);
    updateSettings.mutate({
      capital_per_trade: form.capital_per_trade || null,
      tp1_percent: toNum(form.tp1_percent),
      tp1_sell_percent: toNum(form.tp1_sell_percent),
      tp2_percent: toNum(form.tp2_percent),
      trailing_sl_percent: toNum(form.trailing_sl_percent),
      stop_loss: toNum(form.stop_loss),
      max_positions: toNum(form.max_positions),
      daily_loss_limit_percent: toNum(form.daily_loss_limit_percent),
      slippage: toNum(form.slippage),
    });
    setDirty(false);
  };

  const handleAddBlacklist = () => {
    if (!blAddress.trim()) return;
    addBlacklist.mutate({ token_address: blAddress.trim(), reason: blReason.trim() || undefined });
    setBlAddress('');
    setBlReason('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Skeleton className="h-80 w-full" /></Card>
          <Card><Skeleton className="h-80 w-full" /></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-xs text-text-muted">Changes apply to future trades only.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-6 uppercase tracking-wider">Trading Settings</h2>
          <div className="space-y-4">
            <Input
              label="Capital per Trade"
              placeholder="e.g., 0.5 SOL or 10%"
              value={form.capital_per_trade}
              onChange={(e) => handleChange('capital_per_trade', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Take Profit 1"
                type="number"
                placeholder="50"
                suffix="%"
                value={form.tp1_percent}
                onChange={(e) => handleChange('tp1_percent', e.target.value)}
              />
              <Input
                label="TP1 Sell Amount"
                type="number"
                placeholder="50"
                suffix="%"
                value={form.tp1_sell_percent}
                onChange={(e) => handleChange('tp1_sell_percent', e.target.value)}
              />
            </div>
            <Input
              label="Take Profit 2"
              type="number"
              placeholder="100"
              suffix="%"
              value={form.tp2_percent}
              onChange={(e) => handleChange('tp2_percent', e.target.value)}
            />
            <Input
              label="Trailing Stop Loss"
              type="number"
              placeholder="15"
              suffix="%"
              value={form.trailing_sl_percent}
              onChange={(e) => handleChange('trailing_sl_percent', e.target.value)}
            />
            <Input
              label="Stop Loss"
              type="number"
              placeholder="-30"
              suffix="%"
              value={form.stop_loss}
              onChange={(e) => handleChange('stop_loss', e.target.value)}
            />
            <Input
              label="Max Open Positions"
              type="number"
              placeholder="5"
              value={form.max_positions}
              onChange={(e) => handleChange('max_positions', e.target.value)}
            />
            <Input
              label="Daily Loss Limit"
              type="number"
              placeholder="10"
              suffix="%"
              value={form.daily_loss_limit_percent}
              onChange={(e) => handleChange('daily_loss_limit_percent', e.target.value)}
            />
            <Input
              label="Slippage"
              type="number"
              placeholder="5"
              suffix="%"
              value={form.slippage}
              onChange={(e) => handleChange('slippage', e.target.value)}
            />
            <Button
              onClick={handleSave}
              disabled={!dirty || updateSettings.isPending}
              className="w-full mt-2"
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-6 uppercase tracking-wider">Token Blacklist</h2>

          <div className="space-y-3 mb-6">
            <Input
              placeholder="Token address"
              value={blAddress}
              onChange={(e) => setBlAddress(e.target.value)}
            />
            <Input
              placeholder="Reason (optional)"
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)}
            />
            <Button
              onClick={handleAddBlacklist}
              disabled={!blAddress.trim() || addBlacklist.isPending}
              size="sm"
              className="w-full"
            >
              Add to Blacklist
            </Button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {settings?.blacklist.length === 0 && (
              <p className="text-xs text-text-muted text-center py-4">No blacklisted tokens</p>
            )}
            {settings?.blacklist.map((item) => (
              <div
                key={item.token_address}
                className="flex items-center justify-between bg-bg rounded-lg px-3 py-2 border border-border/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-text-primary">{truncateAddress(item.token_address)}</span>
                    <CopyButton text={item.token_address} />
                    <span className="text-xs text-text-muted">{item.chain}</span>
                  </div>
                  {item.reason && <p className="text-xs text-text-muted mt-0.5">{item.reason}</p>}
                  <p className="text-xs text-text-muted mt-0.5">{formatDate(item.added_at)}</p>
                </div>
                <button
                  onClick={() => removeBlacklist.mutate(item.token_address)}
                  className="text-text-muted hover:text-red transition-colors ml-2 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
