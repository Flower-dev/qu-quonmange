import { cn } from '@/lib/utils';
const L = { 1: '€', 2: '€€', 3: '€€€' } as const;
export function BudgetBadge({ budget, className }: { budget: 1|2|3; className?: string }) {
  return <span className={cn('inline-flex items-center px-2 py-px rounded text-[11px] font-bold border border-border text-text-secondary bg-bg-dark', className)}>{L[budget]}</span>;
}
