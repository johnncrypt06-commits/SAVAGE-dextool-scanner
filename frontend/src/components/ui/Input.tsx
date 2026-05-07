import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
}

export default function Input({ label, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-text-secondary font-medium">{label}</label>}
      <div className="relative">
        <input
          className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary
            placeholder:text-text-muted focus:outline-none focus:border-green/40 focus:shadow-[0_0_8px_rgba(0,255,136,0.08)]
            transition-all duration-200 font-mono ${suffix ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}
