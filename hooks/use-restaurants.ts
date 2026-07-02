'use client';

import { useSyncExternalStore, useCallback } from 'react';
import type { Restaurant } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import initialData from '@/data/restaurants.json';

function seedRestaurants(): Restaurant[] {
  return (initialData.restaurants as unknown as Restaurant[]).map((r) => ({
    ...r,
    budget: r.budget ?? (2 as const),
    coords: r.coords ?? null,
    website: r.website ?? null,
    address: r.address ?? null,
    menu: r.menu ?? null,
  }));
}

// ── External store pour localStorage ──

let cachedRestaurants: Restaurant[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Restaurant[] {
  if (cachedRestaurants !== null) return cachedRestaurants;
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    cachedRestaurants = stored;
  } else {
    const seed = seedRestaurants();
    saveToStorage(seed);
    cachedRestaurants = seed;
  }
  return cachedRestaurants;
}

const serverSnapshot = seedRestaurants();
function getServerSnapshot(): Restaurant[] {
  return serverSnapshot;
}

function setStore(updater: (prev: Restaurant[]) => Restaurant[]) {
  const prev = cachedRestaurants ?? seedRestaurants();
  const next = updater(prev);
  cachedRestaurants = next;
  saveToStorage(next);
  notify();
}

// ── Hook ──

export function useRestaurants() {
  const restaurants = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((data: Omit<Restaurant, 'id'>) => {
    const newRestaurant: Restaurant = { id: String(Date.now()), ...data };
    setStore((prev) => [...prev, newRestaurant]);
  }, []);

  const update = useCallback((id: string, data: Partial<Restaurant>) => {
    setStore((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setStore((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const incrementRecurrence = useCallback((id: string) => {
    setStore((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, recurrence: Math.min(r.recurrence + 1, 5) } : r
      )
    );
  }, []);

  return { restaurants, add, update, remove, incrementRecurrence };
}
