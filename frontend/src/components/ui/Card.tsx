import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div
      className={`
        bg-surface/80 backdrop-blur-xl border border-border rounded-xl p-6
        transition-all duration-300
        ${glow ? 'hover:border-green/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.05)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
