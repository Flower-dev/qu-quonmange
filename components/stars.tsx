import { cn } from '@/lib/utils';

export function Stars({ count, onChange, className }: { count: number; onChange?: (v: number) => void; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} role={onChange ? 'group' : undefined}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = i < count;
        return onChange
          ? <button key={i} onClick={() => onChange(i + 1)} className={cn('transition-all duration-150 text-base', a ? 'text-coral' : 'text-border', 'hover:scale-125 hover:text-coral')} aria-label={`Note ${i + 1} sur 5`}>★</button>
          : <span key={i} className={cn('text-sm', a ? 'text-coral' : 'text-border')}>★</span>;
      })}
    </span>
  );
}
