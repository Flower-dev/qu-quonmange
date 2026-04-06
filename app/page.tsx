'use client';

import { useState, useCallback, useMemo } from 'react';
import initialData from '@/data/restaurants.json';

interface Restaurant {
  id: string;
  name: string;
  category: string;
  description: string;
  emoji: string;
  appreciation: number;
  recurrence: number;
}

/** Tirage pondéré : poids = appreciation * (6 - recurrence) */
function weightedRandom(restaurants: Restaurant[]): Restaurant {
  const weights = restaurants.map(
    (r) => r.appreciation * (6 - r.recurrence)
  );
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < restaurants.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return restaurants[i];
  }
  return restaurants[restaurants.length - 1];
}

function Stars({ count, onChange }: { count: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`${i < count ? 'opacity-100' : 'opacity-30'} ${onChange ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
          onClick={() => onChange?.(i + 1)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

const emptyRestaurant: Omit<Restaurant, 'id'> = {
  name: '',
  category: '',
  description: '',
  emoji: '🍴',
  appreciation: 3,
  recurrence: 1,
};

/* Floating blobs background */
const BLOBS = [
  { color: 'bg-pink-500', size: 'w-20 h-20 sm:w-28 sm:h-28', pos: 'top-16 -left-6', opacity: 'opacity-60' },
  { color: 'bg-teal-400', size: 'w-24 h-24 sm:w-32 sm:h-32', pos: 'top-28 -right-8 sm:right-4', opacity: 'opacity-50' },
  { color: 'bg-amber-500', size: 'w-16 h-16 sm:w-24 sm:h-24', pos: 'bottom-40 left-8 sm:left-20', opacity: 'opacity-50', rounded: 'rounded-2xl rotate-12' },
  { color: 'bg-purple-400', size: 'w-14 h-14 sm:w-20 sm:h-20', pos: 'bottom-24 right-12 sm:right-32', opacity: 'opacity-40' },
  { color: 'bg-fuchsia-500', size: 'w-10 h-10 sm:w-14 sm:h-14', pos: 'top-1/2 left-1/4', opacity: 'opacity-25', rounded: 'rounded-xl rotate-45' },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    initialData.restaurants as Restaurant[]
  );
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tab, setTab] = useState<'spin' | 'list' | 'edit'>('spin');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Restaurant, 'id'>>(emptyRestaurant);

  const categories = useMemo(
    () => [...new Set(restaurants.map((r) => r.category))],
    [restaurants]
  );

  const handleSpin = useCallback(() => {
    if (isSpinning || restaurants.length === 0) return;
    setIsSpinning(true);
    setSelected(null);

    let current = 0;
    const spins = 15;
    const interval = setInterval(() => {
      setSelected(weightedRandom(restaurants));
      current++;
      if (current >= spins) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 80 + current * 10);
  }, [isSpinning, restaurants]);

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyRestaurant);
    setTab('edit');
  };

  const startEdit = (r: Restaurant) => {
    setEditingId(r.id);
    setForm({ name: r.name, category: r.category, description: r.description, emoji: r.emoji, appreciation: r.appreciation, recurrence: r.recurrence });
    setTab('edit');
  };

  const saveForm = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...form } : r))
      );
    } else {
      const newId = String(Date.now());
      setRestaurants((prev) => [...prev, { id: newId, ...form }]);
    }
    setEditingId(null);
    setForm(emptyRestaurant);
    setTab('list');
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e1a] text-white relative overflow-hidden flex flex-col">
      {/* Floating blobs */}
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className={`absolute ${b.pos} ${b.size} ${b.color} ${b.opacity} ${b.rounded || 'rounded-full'} blur-sm animate-blob pointer-events-none`}
          style={{ animationDelay: `${i * 1.5}s` }}
        />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-fuchsia-500/30">
            🍴
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Qué qu&apos;on mange ?
            </h1>
            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              🎲 Le jeu qui décide pour toi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 border border-amber-400/30 rounded-full px-3 py-1.5 bg-amber-400/10">
            🏷️ {categories.length} catégories
          </span>
          <button
            onClick={() => setTab('list')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 border border-teal-400/30 rounded-full px-3 py-1.5 bg-teal-400/10 hover:bg-teal-400/20 transition-colors"
          >
            🍜 {restaurants.length} restos
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-10">

        {/* === TAB: TIRAGE === */}
        {tab === 'spin' && (
          <section className="flex flex-col items-center gap-5 w-full max-w-md flex-1 justify-center">
            {/* Status pill */}
            <div className="text-xs font-semibold text-gray-400 border border-gray-700 rounded-full px-4 py-1.5 bg-gray-800/50 backdrop-blur">
              {selected && !isSpinning ? '🎉 Résultat' : '🎯 Prêt à jouer ?'}
            </div>

            {/* Glass card */}
            <div className="w-full rounded-2xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-xl p-6 sm:p-8 flex flex-col items-center gap-4 shadow-2xl">
              <div
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center text-6xl sm:text-7xl transition-all duration-500 ${
                  isSpinning ? 'animate-spin' : ''
                } ${
                  selected && !isSpinning
                    ? 'bg-gradient-to-br from-fuchsia-500/30 to-teal-500/30 border border-fuchsia-400/30 shadow-lg shadow-fuchsia-500/20'
                    : 'bg-gray-700/40 border border-gray-600/30'
                }`}
              >
                {selected?.emoji || '🎲'}
              </div>

              {selected && !isSpinning ? (
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-black">
                    {selected.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{selected.category}</p>
                  <p className="text-sm text-gray-300 mt-2 max-w-xs">{selected.description}</p>
                  <div className="flex justify-center gap-4 mt-3 text-sm text-amber-400">
                    <span className="flex items-center gap-1">
                      <Stars count={selected.appreciation} />
                    </span>
                    <span className="text-gray-600">|</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      Fréquence <Stars count={selected.recurrence} />
                    </span>
                  </div>
                </div>
              ) : !isSpinning ? (
                <p className="text-gray-500 text-sm">Lance les dés pour découvrir ton resto !</p>
              ) : (
                <p className="text-gray-400 text-sm animate-pulse">Tirage en cours...</p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`group relative px-10 py-3.5 rounded-full font-black text-base tracking-wide transition-all duration-300 ${
                isSpinning
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-teal-400 text-white hover:shadow-xl hover:shadow-fuchsia-500/25 active:scale-95'
              }`}
            >
              <span className="flex items-center gap-2">
                ⚡ {isSpinning ? 'EN COURS...' : 'LANCER !'}
              </span>
            </button>

            {/* Bottom stats */}
            <div className="flex items-center gap-3 mt-2">
              <div className="text-xs font-semibold text-teal-300 border border-teal-400/20 rounded-xl px-4 py-2 bg-teal-400/5">
                🍜 {restaurants.length} restos
              </div>
              <div className="text-xs font-semibold text-amber-300 border border-amber-400/20 rounded-xl px-4 py-2 bg-amber-400/5">
                🏷️ {categories.length} catégories
              </div>
            </div>
          </section>
        )}

        {/* === TAB: LISTE === */}
        {tab === 'list' && (
          <section className="w-full max-w-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Mes restaurants</h2>
              <button
                onClick={() => setTab('spin')}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Retour au tirage
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm hover:bg-gray-800/60 transition-colors group"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white truncate">{r.name}</h3>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">{r.category}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-amber-400">
                      <Stars count={r.appreciation} />
                    </div>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(r)}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteRestaurant(r.id)}
                        className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={startAdd}
              className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-600 hover:border-teal-400/50 hover:bg-teal-400/5 transition-colors text-gray-500 hover:text-teal-300 font-semibold text-sm"
            >
              + Ajouter un restaurant
            </button>
          </section>
        )}

        {/* === TAB: ÉDITEUR === */}
        {tab === 'edit' && (
          <section className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editingId ? '✏️ Modifier' : '➕ Nouveau restaurant'}
              </h2>
              <button
                onClick={() => { setEditingId(null); setForm(emptyRestaurant); setTab('list'); }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Retour
              </button>
            </div>
            <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-xl p-5 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Emoji</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-2xl text-center text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nom</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nom du restaurant"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Japonais, Pizzeria..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Courte description"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Appréciation</label>
                  <div className="text-xl text-amber-400 mt-1">
                    <Stars count={form.appreciation} onChange={(v) => setForm({ ...form, appreciation: v })} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Récurrence</label>
                  <div className="text-xl text-amber-400 mt-1">
                    <Stars count={form.recurrence} onChange={(v) => setForm({ ...form, recurrence: v })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => { setEditingId(null); setForm(emptyRestaurant); setTab('list'); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveForm}
                  disabled={!form.name.trim()}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-fuchsia-500 to-teal-400 text-white hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
                >
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
