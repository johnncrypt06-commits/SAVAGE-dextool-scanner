interface PnlTextProps {
  value: number;
  prefix?: string;
  className?: string;
}

export default function PnlText({ value, prefix = '', className = '' }: PnlTextProps) {
  const color = value >= 0 ? 'text-green' : 'text-red';
  const sign = value >= 0 ? '+' : '';
  return (
    <span className={`${color} font-mono ${className}`}>
      {prefix}{sign}{value.toFixed(2)}%
    </span>
  );
}
