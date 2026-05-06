import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

const variantStyles: Record<string, string> = {
  primary: 'bg-green/15 text-green border border-green/30 hover:bg-green/25 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]',
  danger: 'bg-red/15 text-red border border-red/30 hover:bg-red/25',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
  outline: 'border border-border text-text-secondary hover:border-text-muted hover:text-text-primary',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variantStyles[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
