export const APP_NAME = 'ALPHA';
export const APP_TAGLINE = 'Advanced Solana Trading Terminal';

export const CLOSE_REASON_COLORS: Record<string, { bg: string; text: string }> = {
  TP1: { bg: 'bg-green/15', text: 'text-green' },
  TP2: { bg: 'bg-cyan/15', text: 'text-cyan' },
  SL: { bg: 'bg-red/15', text: 'text-red' },
  'Trailing SL': { bg: 'bg-yellow/15', text: 'text-yellow' },
  Manual: { bg: 'bg-text-muted/15', text: 'text-text-secondary' },
  'Anti-Rug': { bg: 'bg-yellow/15', text: 'text-yellow' },
};
