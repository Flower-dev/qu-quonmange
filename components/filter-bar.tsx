'use client';

import { cn } from '@/lib/utils';
import type { Filters } from '@/lib/types';

const D = [{ value: 1, label: '1 km' },{ value: 2, label: '2 km' },{ value: 5, label: '5 km' },{ value: 10, label: '10 km' }];
const R = [{ value: 1, label: '1' },{ value: 2, label: '2' },{ value: 3, label: '3' },{ value: 4, label: '4' },{ value: 5, label: '5' }];

export function FilterBar({ filters, setFilters, resetFilters, categories, geolocationAvailable, className }: {
  filters: Filters; setFilters: (f: Filters) => void; resetFilters: () => void; categories: string[]; geolocationAvailable: boolean; className?: string;
}) {
  const has = filters.categories.length > 0 || filters.budget.length > 0 || filters.maxDistance !== null || filters.maxRecurrence !== null;
  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Filtres</span>
        {has && <button onClick={resetFilters} className="text-[11px] font-semibold text-accent hover:text-accent-dark">Réinitialiser</button>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => {
          const a = filters.categories.includes(c);
          return <button key={c} onClick={() => setFilters({ ...filters, categories: a ? filters.categories.filter(x => x !== c) : [...filters.categories, c] })} className={cn('px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors', a ? 'bg-accent text-white' : 'bg-bg-dark text-text-secondary hover:text-text')}>{c}{a && ' ×'}</button>;
        })}
        {categories.length > 0 && <span className="w-px bg-border self-stretch mx-0.5" />}
        {([1,2,3] as const).map(b => {
          const a = filters.budget.includes(b);
          const L = { 1: '€', 2: '€€', 3: '€€€' } as const;
          return <button key={b} onClick={() => setFilters({ ...filters, budget: a ? filters.budget.filter(x => x !== b) : [...filters.budget, b] })} className={cn('px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors', a ? 'bg-accent text-white' : 'bg-bg-dark text-text-secondary hover:text-text')}>{L[b]}</button>;
        })}
        <select value={filters.maxDistance ?? ''} onChange={e => setFilters({ ...filters, maxDistance: e.target.value ? Number(e.target.value) : null })} disabled={!geolocationAvailable}
          className={cn('px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-bg-dark border-0 text-text-secondary cursor-pointer', !geolocationAvailable && 'opacity-40', filters.maxDistance !== null && 'text-accent')}>
          <option value="">Distance</option>{D.map(o => <option key={o.value} value={o.value}>≤ {o.label}</option>)}
        </select>
        <select value={filters.maxRecurrence ?? ''} onChange={e => setFilters({ ...filters, maxRecurrence: e.target.value ? Number(e.target.value) : null })}
          className={cn('px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-bg-dark border-0 text-text-secondary cursor-pointer', filters.maxRecurrence !== null && 'text-accent')}>
          <option value="">Fréquence</option>{R.map(o => <option key={o.value} value={o.value}>≤ {o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
