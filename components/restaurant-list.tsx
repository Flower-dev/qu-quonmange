'use client';

import { useState } from 'react';
import type { Restaurant, Filters } from '@/lib/types';
import { Stars } from '@/components/stars';
import { BudgetBadge } from '@/components/budget-badge';
import { DistanceBadge } from '@/components/distance-badge';
import { FilterBar } from '@/components/filter-bar';
import { MapPreview } from '@/components/map-preview';
import { RestaurantLinks } from '@/components/restaurant-links';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Props {
  restaurants: Restaurant[]; filteredRestaurants: Restaurant[]; filters: Filters;
  setFilters: (f: Filters) => void; resetFilters: () => void; categories: string[];
  geolocationAvailable: boolean; userPosition: { lat: number; lng: number } | null;
  onEdit: (r: Restaurant) => void; onDelete: (id: string) => void; onAdd: () => void;
}

export function RestaurantList({ restaurants, filteredRestaurants, filters, setFilters, resetFilters, categories, geolocationAvailable, userPosition, onEdit, onDelete, onAdd }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);

  if (restaurants.length === 0) return (
    <section className="w-full flex flex-col items-center justify-center gap-6 py-28">
      <span className="text-6xl">🍽️</span>
      <h2 className="font-heading text-xl font-black italic">Aucun restaurant</h2>
      <p className="text-sm text-text-secondary">Ajoute tes adresses pour commencer.</p>
      <button onClick={onAdd} className="px-6 py-3 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accent-dark transition-all active:scale-[0.97]">+ Premier restaurant</button>
    </section>
  );

  return (
    <section className="w-full flex flex-col gap-6 pt-6">
      <div className="flex items-end justify-between">
        <h2 className="font-heading text-2xl font-black italic">Mes Adresses</h2>
        <span className="text-xs text-text-muted">{filteredRestaurants.length}/{restaurants.length}</span>
      </div>

      <div className="rounded-xl bg-surface border border-border p-4">
        <FilterBar filters={filters} setFilters={setFilters} resetFilters={resetFilters} categories={categories} geolocationAvailable={geolocationAvailable} />
      </div>

      {filteredRestaurants.length === 0 ? (
        <p className="text-center text-sm text-text-secondary py-12">Aucun résultat. <button onClick={resetFilters} className="text-accent font-semibold hover:underline">Réinitialiser</button></p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRestaurants.map((r, i) => (
            <article key={r.id} className="group bg-surface rounded-xl border border-border hover:border-border hover:shadow-sm transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 50}ms`, opacity: 0, animationFillMode: 'forwards' }}>
              <div className="p-4 sm:p-5 flex items-start gap-4">
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-200">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-text italic truncate">{r.name}</h3>
                      <p className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-semibold mt-0.5">{r.category}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => onEdit(r)} className="p-1.5 rounded-lg text-accent hover:bg-accent/5 transition-colors" aria-label={`Modifier ${r.name}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg text-red/60 hover:text-red hover:bg-red/5 transition-colors" aria-label={`Supprimer ${r.name}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">{r.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Stars count={r.appreciation} /> <BudgetBadge budget={r.budget} />
                    <DistanceBadge restaurantCoords={r.coords} userPosition={userPosition} />
                  </div>
                  <div className="mt-3 space-y-2">
                    {r.hours && <p className="text-[11px] text-text-muted flex items-center gap-1"><svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>{r.hours}</p>}
                    <RestaurantLinks restaurant={r} />
                    {r.coords && <MapPreview coords={r.coords} address={r.address} />}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <button onClick={onAdd} className="w-full py-3.5 rounded-xl border-2 border-dashed border-border text-text-muted hover:text-accent hover:border-accent/30 font-semibold text-sm transition-all active:scale-[0.99]">+ Ajouter un restaurant</button>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer {deleteTarget?.name} ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (deleteTarget) { onDelete(deleteTarget.id); setDeleteTarget(null); } }}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
