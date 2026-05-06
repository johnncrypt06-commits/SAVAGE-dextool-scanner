interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export default function Toggle({ enabled, onChange, disabled = false, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${enabled ? 'bg-green/30' : 'bg-border'}
      `}
    >
      {label && <span className="sr-only">{label}</span>}
      <span
        className={`
          inline-block h-4 w-4 rounded-full transition-transform duration-200
          ${enabled ? 'translate-x-6 bg-green' : 'translate-x-1 bg-text-muted'}
        `}
      />
    </button>
  );
}
