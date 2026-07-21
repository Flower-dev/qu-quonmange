'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { Restaurant, Filters } from '@/lib/types';
import { weightedRandom } from '@/lib/weighted-random';
import { Stars } from '@/components/stars';
import { BudgetBadge } from '@/components/budget-badge';
import { DistanceBadge } from '@/components/distance-badge';
import { FilterBar } from '@/components/filter-bar';
import { MapPreview } from '@/components/map-preview';
import { cn } from '@/lib/utils';

interface Props {
  filteredRestaurants: Restaurant[]; allRestaurants: Restaurant[];
  filters: Filters; setFilters: (f: Filters) => void; resetFilters: () => void;
  categories: string[]; geolocationAvailable: boolean;
  userPosition: { lat: number; lng: number } | null; incrementRecurrence: (id: string) => void;
}

type Phase = 'idle' | 'spinning' | 'done' | 'celebrating';

export function SpinnerView({ filteredRestaurants, allRestaurants, filters, setFilters, resetFilters, categories, geolocationAvailable, userPosition, incrementRecurrence }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);

  const orbitItems = useMemo(() => filteredRestaurants.slice(0, 12).map(r => ({ id: r.id, emoji: r.emoji })), [filteredRestaurants]);

  const spin = useCallback(() => {
    if (phase !== 'idle' || filteredRestaurants.length === 0) return;
    setPhase('spinning');
    let t = 0;
    const run = () => { setSelected(weightedRandom(filteredRestaurants)); t++;
      if (t >= 18) { const final = weightedRandom(filteredRestaurants); setSelected(final); setPhase('done'); }
      else timeoutRef.current = setTimeout(run, 50 + t * 24); };
    timeoutRef.current = setTimeout(run, 50);
  }, [phase, filteredRestaurants]);

  const retirer = useCallback(() => { setPhase('idle'); setSelected(null); setTimeout(() => spin(), 200); }, [spin]);
  const accept = useCallback(() => { if (!selected) return; incrementRecurrence(selected.id); setPhase('celebrating'); setTimeout(() => { setPhase('idle'); setSelected(null); }, 800); }, [selected, incrementRecurrence]);

  const eligible = filteredRestaurants.length;
  const hasFilters = filters.categories.length > 0 || filters.budget.length > 0 || filters.maxDistance !== null || filters.maxRecurrence !== null;

  return (
    <section className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto flex-1 justify-center pt-6">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between gap-3">
        <button onClick={() => setShowFilters(!showFilters)}
          className={cn('flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors',
            hasFilters ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text hover:bg-bg-dark')}>Filtres{hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}</button>
        <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg', eligible === 0 ? 'text-red/80 bg-red/5' : 'text-accent bg-accent/5')}>{eligible} eligible{eligible !== 1 ? 's' : ''}</span>
      </div>

      {showFilters && (
        <div className="w-full rounded-xl bg-surface border border-border p-5 animate-fade-up">
          <FilterBar filters={filters} setFilters={setFilters} resetFilters={resetFilters} categories={categories} geolocationAvailable={geolocationAvailable} />
        </div>
      )}

      {/* Roulette / Result zone */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Glow effect when done */}
        <div className={cn('absolute -inset-10 rounded-full transition-all duration-700',
          phase === 'done' && 'bg-accent/3 blur-3xl',
          phase === 'celebrating' && 'bg-accent/5 blur-3xl')} />

        {/* Outer ring */}
        <div className={cn('absolute inset-0 rounded-full border-[3px] transition-all duration-500',
          phase === 'done' ? 'border-accent/40' :
          phase === 'celebrating' ? 'border-accent/50' :
          phase === 'spinning' ? 'border-border' : 'border-border')} />

        {/* Dashed inner ring */}
        <div className={cn('absolute inset-8 rounded-full border border-dashed transition-all duration-500',
          phase === 'celebrating' ? 'border-accent/20' :
          phase === 'done' ? 'border-accent/12' : 'border-border/40')} />

        {/* Dots */}
        <div className="absolute inset-6 rounded-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={cn('absolute w-1.5 h-1.5 rounded-full transition-colors duration-500',
              phase === 'celebrating' ? 'bg-accent/40' :
              phase === 'done' ? 'bg-accent/20' : 'bg-border')}
              style={{ top: '50%', left: '50%', transform: `rotate(${i * 18}deg) translateY(-${(phase === 'spinning' ? 152 : 156) - 20}px) translate(-50%, -50%)` }} />
          ))}
        </div>

        {/* Orbit emojis */}
        {phase !== 'done' && orbitItems.map((r, i) => {
          const a = (360 / orbitItems.length) * i; const rad = (a * Math.PI) / 180;
          const s: Record<string, string | undefined> = {
            top: '50%', left: '50%', transformOrigin: '0 0',
            marginTop: '-0.5em', marginLeft: '-0.5em',
            ['--orbit-start' as string]: `${a}deg`,
            ['--orbit-radius' as string]: '130px',
            animation: phase === 'spinning' ? `orbit 0.7s linear infinite` : `orbit ${6 + i * 0.35}s linear infinite`,
          };
          if (phase === 'celebrating') {
            s['--burst-x'] = `${Math.cos(rad) * (110 + Math.random() * 70)}px`;
            s['--burst-y'] = `${Math.sin(rad) * (110 + Math.random() * 70) - 60}px`;
            s.animation = undefined;
          }
          return (
            <span key={r.id} style={s} className={cn('absolute text-xl transition-all duration-500 pointer-events-none',
              phase === 'celebrating' ? 'animate-celebrate' :
              phase === 'spinning' ? 'opacity-15 blur-[1px]' : 'opacity-50 hover:opacity-70')}>
              {r.emoji}
            </span>
          );
        })}

        {/* Center — cliquable */}
        <button
          onClick={phase === 'idle' && eligible > 0 ? spin : undefined}
          disabled={phase !== 'idle'}
          aria-label="Lancer la roulette"
          className={cn('relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500',
            phase === 'celebrating' ? 'bg-surface shadow-2xl scale-110 ring-2 ring-accent/30' :
            phase === 'done' ? 'bg-surface shadow-xl scale-105' :
            phase === 'spinning' ? 'bg-bg-dark shadow-inner' :
            'bg-surface shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95')}>
          {phase === 'celebrating' && selected ? (
            <span className="text-6xl animate-float">🎉</span>
          ) : phase === 'done' && selected ? (
            <span className="text-5xl animate-scale-in">{selected.emoji}</span>
          ) : phase === 'spinning' && selected ? (
            <span className="text-5xl animate-wiggle">{selected.emoji}</span>
          ) : (
            <span className="flex flex-col items-center gap-2">
              <span className="text-5xl animate-float">🍽️</span>
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-widest">Toucher</span>
            </span>
          )}
        </button>
      </div>

      {/* Result */}
      {phase === 'done' && selected && (
        <div className="w-full text-center animate-fade-up space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-black italic text-text tracking-tight">{selected.name}</h2>
          <p className="text-xs text-text-muted uppercase tracking-[0.15em] font-semibold">{selected.category}</p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">{selected.description}</p>
          <div className="flex flex-wrap justify-center gap-2.5 mt-3">
            <Stars count={selected.appreciation} />
            <BudgetBadge budget={selected.budget} />
            <DistanceBadge restaurantCoords={selected.coords} userPosition={userPosition} />
          </div>
          <div className="flex items-center gap-1.5 justify-center"><span className="text-[11px] text-text-secondary">Fréquence</span><Stars count={selected.recurrence} className="text-[11px]" /></div>
          {selected.hours && <p className="text-[11px] text-text-muted flex items-center justify-center gap-1"><svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>{selected.hours}</p>}
        </div>
      )}

      {/* Actions */}
      <div>
        {phase === 'idle' && eligible === 0 && (
          <p className="text-sm text-text-secondary">Aucun restaurant. <button onClick={resetFilters} className="text-accent font-semibold hover:underline">Réinitialiser</button></p>
        )}
        {phase === 'idle' && eligible > 0 && (
          <button onClick={spin} className="px-10 py-3 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accent-dark transition-all active:scale-[0.97] shadow-sm">
            Lancer la roulette
          </button>
        )}
        {phase === 'spinning' && <p className="text-sm text-text-secondary animate-pulse">Ça tourne…</p>}
        {phase === 'celebrating' && <p className="font-heading text-lg font-black italic text-accent animate-fade-up">Bon appétit !</p>}
        {phase === 'done' && selected && (
          <div className="flex items-center gap-3 animate-fade-up">
            <button onClick={retirer} className="px-5 py-3 rounded-xl font-semibold text-sm bg-surface border border-border text-text-secondary hover:text-text hover:bg-bg-dark transition-all active:scale-[0.97]">Relancer</button>
            <button onClick={accept} className="px-6 py-3 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accent-dark transition-all active:scale-[0.97]">🎉 On y va !</button>
          </div>
        )}
      </div>

      {phase === 'done' && selected?.coords && (
        <MapPreview coords={selected.coords} address={selected.address} className="w-full animate-fade-up" />
      )}

      {phase === 'idle' && (
        <p className="text-xs text-text-muted">{allRestaurants.length} restaurants · {categories.length} catégories</p>
      )}
    </section>
  );
}
