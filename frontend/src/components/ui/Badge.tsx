import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'red' | 'cyan' | 'yellow' | 'muted';
  className?: string;
}

const variants: Record<string, string> = {
  green: 'bg-green/15 text-green',
  red: 'bg-red/15 text-red',
  cyan: 'bg-cyan/15 text-cyan',
  yellow: 'bg-yellow/15 text-yellow',
  muted: 'bg-text-muted/15 text-text-secondary',
};

export default function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
