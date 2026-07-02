'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Restaurant } from '@/lib/types';
import { useRestaurants } from '@/hooks/use-restaurants';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useFilters } from '@/hooks/use-filters';
import { SpinnerView } from '@/components/spinner-view';
import { RestaurantList } from '@/components/restaurant-list';
import { RestaurantForm } from '@/components/restaurant-form';
import { ErrorBoundary } from '@/components/error-boundary';

type Tab = 'spin' | 'list' | 'edit';

export default function Home() {
  const { restaurants, add, update, remove, incrementRecurrence } = useRestaurants();
  const geo = useGeolocation();
  const { filters, setFilters, resetFilters, filteredRestaurants, categories } = useFilters(restaurants, geo.position);
  const [tab, setTab] = useState<Tab>('spin');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const [geoRequested, setGeoRequested] = useState(false);
  useEffect(() => { if (!geoRequested && typeof navigator !== 'undefined') { setGeoRequested(true); geo.requestPosition(); } }, [geoRequested]); // eslint-disable-line

  const handleEdit = useCallback((r: Restaurant) => { setEditingRestaurant(r); setTab('edit'); }, []);
  const handleAdd = useCallback(() => { setEditingRestaurant(null); setTab('edit'); }, []);
  const handleSave = useCallback((d: Omit<Restaurant, 'id'>) => { if (editingRestaurant) update(editingRestaurant.id, d); else add(d); setEditingRestaurant(null); setTab('list'); }, [editingRestaurant, update, add]);
  const handleCancel = useCallback(() => { setEditingRestaurant(null); setTab('list'); }, []);

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-heading text-xl sm:text-2xl font-black italic tracking-tight">Qu&apos;est-ce qu&apos;on mange&nbsp;?</h1>
          <nav className="flex gap-1" role="tablist">
            <button role="tab" aria-selected={tab === 'spin'} onClick={() => setTab('spin')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === 'spin' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text hover:bg-bg-dark'}`}>Tirage</button>
            <button role="tab" aria-selected={tab === 'list' || tab === 'edit'} onClick={() => setTab('list')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === 'list' || tab === 'edit' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text hover:bg-bg-dark'}`}>Adresses <span className="ml-1.5 opacity-60 text-xs">{restaurants.length}</span></button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <div className="max-w-2xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
            {tab === 'spin' && <SpinnerView filteredRestaurants={filteredRestaurants} allRestaurants={restaurants} filters={filters} setFilters={setFilters} resetFilters={resetFilters} categories={categories} geolocationAvailable={geo.position !== null} userPosition={geo.position} incrementRecurrence={incrementRecurrence} />}
            {tab === 'list' && <RestaurantList restaurants={restaurants} filteredRestaurants={filteredRestaurants} filters={filters} setFilters={setFilters} resetFilters={resetFilters} categories={categories} geolocationAvailable={geo.position !== null} userPosition={geo.position} onEdit={handleEdit} onDelete={remove} onAdd={handleAdd} />}
            {tab === 'edit' && <RestaurantForm restaurant={editingRestaurant} onSave={handleSave} onCancel={handleCancel} onRequestPosition={geo.requestPosition} userPosition={geo.position} geoLoading={geo.loading} />}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
