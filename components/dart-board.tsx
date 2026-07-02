'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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

type Phase = 'idle' | 'throwing' | 'landed' | 'celebrating';

export function DartBoard({ filteredRestaurants, allRestaurants, filters, setFilters, resetFilters, categories, geolocationAvailable, userPosition, incrementRecurrence }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [boardRotation, setBoardRotation] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);

  const slices = useMemo(() => filteredRestaurants.slice(0, 16), [filteredRestaurants]);
  const sliceCount = slices.length || 1;
  const sliceAngle = 360 / sliceCount;

  const conic = slices.map((_, i) => {
    const shades = ['#E8E5E0', '#F0EDE8', '#DCD8D2', '#EDEAE5', '#E2DFD9'];
    const c = shades[i % shades.length];
    const s = (i * sliceAngle).toFixed(2);
    const e = ((i + 1) * sliceAngle).toFixed(2);
    return `${c} ${s}deg ${e}deg`;
  }).join(', ');

  const throwDart = useCallback(() => {
    if (phase !== 'idle' || filteredRestaurants.length === 0) return;
    setPhase('throwing');
    const winIdx = Math.floor(Math.random() * sliceCount);
    const finalAngle = winIdx * sliceAngle + sliceAngle / 2;
    const spins = 3 + Math.floor(Math.random() * 3);
    setBoardRotation(spins * 360 + (360 - finalAngle));
    const pick = weightedRandom(filteredRestaurants);
    timeoutRef.current = setTimeout(() => { setSelected(pick); setPhase('landed'); }, 1600);
  }, [phase, filteredRestaurants, sliceCount, sliceAngle]);

  const retirer = useCallback(() => { setPhase('idle'); setSelected(null); setBoardRotation(0); timeoutRef.current = setTimeout(() => throwDart(), 250); }, [throwDart]);
  const accept = useCallback(() => { if (!selected) return; incrementRecurrence(selected.id); setPhase('celebrating'); timeoutRef.current = setTimeout(() => { setPhase('idle'); setSelected(null); setBoardRotation(0); }, 900); }, [selected, incrementRecurrence]);

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

      {/* Board / Result zone */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {(phase === 'idle' || phase === 'throwing') && (
          <>
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-md"
              style={{
                background: `conic-gradient(from 0deg, ${conic})`,
                transform: `rotate(${boardRotation}deg)`,
                transitionDuration: phase === 'throwing' ? '1.6s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.2, 1)',
              }}>
              <div className="absolute inset-[18%] rounded-full bg-surface ring-1 ring-border" />
              <div className="absolute inset-[22%] rounded-full ring-1 ring-border/50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent" />
            </div>
            {phase === 'throwing' && (
              <div className="absolute z-20 transition-all duration-[1.6s]" style={{ top: '-12%', left: '55%', transform: 'rotate(-48deg)' }}>
                <div className="relative flex items-center" style={{ width: '3px', height: '56px' }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-px">
                    <span className="w-3 h-6 bg-accent rounded-b-sm rounded-t-[2px]" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }} />
                    <span className="w-3 h-6 bg-accent-dark rounded-b-sm rounded-t-[2px]" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }} />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[2px] h-5 bg-text-secondary/60 rounded-full" />
                  <div className="absolute top-[22px] left-1/2 -translate-x-1/2 w-[5px] h-6 bg-text rounded-full shadow-inner" />
                  <div className="absolute top-[44px] left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '2.5px solid transparent', borderRight: '2.5px solid transparent', borderTop: '9px solid #4A4A4A' }} />
                </div>
              </div>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent z-10 pointer-events-none" />
          </>
        )}

        {(phase === 'landed' || phase === 'celebrating') && selected && (
          <div className={cn('absolute inset-0 bg-surface rounded-2xl border border-border flex items-center justify-center transition-all duration-400 shadow-sm',
            phase === 'landed' ? 'animate-scale-in' : 'opacity-60 scale-95')}>
            <div className="text-center px-5 py-4 w-full overflow-y-auto">
              <span className="text-5xl block mb-3">{selected.emoji}</span>
              <h2 className="font-heading text-2xl font-black italic text-text tracking-tight">{selected.name}</h2>
              <p className="text-xs text-text-muted uppercase tracking-[0.15em] font-semibold mt-1 mb-2">{selected.category}</p>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{selected.description}</p>
              <div className="flex flex-wrap justify-center gap-2.5 mt-4">
                <Stars count={selected.appreciation} />
                <BudgetBadge budget={selected.budget} />
                <DistanceBadge restaurantCoords={selected.coords} userPosition={userPosition} />
              </div>
              <div className="flex items-center gap-1.5 mt-2 justify-center"><span className="text-[11px] text-text-secondary">Fréquence</span><Stars count={selected.recurrence} className="text-[11px]" /></div>
            </div>
          </div>
        )}
      </div>

      {phase === 'idle' && eligible === 0 && (
        <p className="text-sm text-text-secondary">Aucun restaurant ne correspond aux filtres. <button onClick={resetFilters} className="text-accent font-semibold hover:underline">Réinitialiser</button></p>
      )}

      <div>
        {phase === 'idle' && (
          <button onClick={throwDart} disabled={eligible === 0}
            className={cn('px-10 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97]',
              eligible === 0 ? 'bg-border text-text-muted cursor-not-allowed' : 'bg-accent text-white hover:bg-accent-dark shadow-sm')}>
            🎯 Lancer la fléchette
          </button>
        )}
        {phase === 'throwing' && <p className="text-sm text-text-secondary animate-pulse">La cible tourne…</p>}
        {phase === 'celebrating' && <p className="font-heading text-lg font-black italic text-accent animate-fade-up">Bon appétit !</p>}
        {phase === 'landed' && selected && (
          <div className="flex items-center gap-3 animate-fade-up">
            <button onClick={retirer} className="px-5 py-3 rounded-xl font-semibold text-sm bg-surface border border-border text-text-secondary hover:text-text hover:bg-bg-dark transition-all active:scale-[0.97]">Rejouer</button>
            <button onClick={accept} className="px-6 py-3 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accent-dark transition-all active:scale-[0.97]">🎉 On y va !</button>
          </div>
        )}
      </div>

      {phase === 'landed' && selected?.coords && (
        <MapPreview coords={selected.coords} address={selected.address} className="w-full animate-fade-up" />
      )}

      {phase === 'idle' && (
        <p className="text-xs text-text-muted">{allRestaurants.length} restaurants · {categories.length} catégories</p>
      )}
    </section>
  );
}
