'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Restaurant } from '@/lib/types';
import { Stars } from '@/components/stars';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const EMPTY: Omit<Restaurant, 'id'> = { name: '', category: '', description: '', emoji: '🍴', appreciation: 3, recurrence: 1, budget: 2, coords: null, website: null, address: null, menu: null };

export function RestaurantForm({ restaurant, onSave, onCancel, onRequestPosition, userPosition, geoLoading }: {
  restaurant?: Restaurant | null; onSave: (d: Omit<Restaurant, 'id'>) => void; onCancel: () => void;
  onRequestPosition: () => void; userPosition: { lat: number; lng: number } | null; geoLoading: boolean;
}) {
  const e = !!restaurant;
  const [f, setF] = useState(restaurant ? { ...EMPTY, ...restaurant } : EMPTY);
  const [aq, setAq] = useState('');
  const [sug, setSug] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [gs, setGs] = useState(false);
  const [ge, setGe] = useState<string | null>(null);
  const dr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ar = useRef<AbortController | null>(null);

  useEffect(() => { return () => ar.current?.abort(); }, []);

  const gc = useCallback(async (q: string, s?: AbortSignal) => {
    if (q.trim().length < 3) { setSug([]); return; }
    setGs(true); setGe(null);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=0`, { headers: { 'Accept-Language': 'fr' }, signal: s });
      if (r.status === 429) { setGe('Trop de requêtes'); return; }
      if (!r.ok) { setGe('Erreur'); return; }
      const d = await r.json() as { display_name: string; lat: string; lon: string }[];
      if (d.length === 0) { setGe('Aucune adresse'); } else { setSug(d); }
    } catch (err: unknown) { if (err instanceof DOMException && err.name === 'AbortError') return; setGe('Erreur'); }
    finally { setGs(false); }
  }, []);

  useEffect(() => { if (dr.current) clearTimeout(dr.current); ar.current?.abort(); if (aq.trim().length < 3) { setSug([]); setGe(null); return; } const c = new AbortController(); ar.current = c; dr.current = setTimeout(() => gc(aq, c.signal), 500); return () => { if (dr.current) clearTimeout(dr.current); }; }, [aq, gc]);

  const pp = useRef(userPosition);
  useEffect(() => { if (userPosition && userPosition !== pp.current) { setF(p => ({ ...p, coords: userPosition })); pp.current = userPosition; } }, [userPosition]);

  const inp = 'w-full px-3.5 py-2.5 bg-bg-dark rounded-lg text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-surface transition-all';

  return (
    <section className="w-full max-w-lg mx-auto animate-fade-up pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-black italic">{e ? 'Modifier' : 'Nouveau'}</h2>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>Retour
        </button>
      </div>

      <div className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Identité</p>
          <div className="grid grid-cols-[4rem_1fr] gap-3">
            <input type="text" value={f.emoji} onChange={ev => setF({ ...f, emoji: ev.target.value })} className={cn(inp, 'text-2xl text-center px-2')} maxLength={4} />
            <input type="text" value={f.name} onChange={ev => setF({ ...f, name: ev.target.value })} placeholder="Nom" className={inp} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={f.category} onChange={ev => setF({ ...f, category: ev.target.value })} placeholder="Catégorie" className={inp} />
            <input type="text" value={f.description} onChange={ev => setF({ ...f, description: ev.target.value })} placeholder="Description" className={inp} />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Notation</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Stars count={f.appreciation} onChange={v => setF({ ...f, appreciation: v })} /></div>
            <div><Stars count={f.recurrence} onChange={v => setF({ ...f, recurrence: v })} /></div>
            <div className="flex gap-2">
              {([1,2,3] as const).map(b => {
                const a = f.budget === b;
                return <button key={b} onClick={() => setF({ ...f, budget: b })} className={cn('px-3.5 py-2 rounded-lg text-sm font-bold transition-colors', a ? 'bg-accent text-white' : 'bg-bg-dark text-text-secondary hover:text-text')}>{b === 1 ? '€' : b === 2 ? '€€' : '€€€'}</button>;
              })}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Localisation</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              <input type="text" value={aq} onChange={ev => setAq(ev.target.value)} placeholder="Rechercher une adresse…" className={cn(inp, 'pl-9')} />
              {gs && <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onRequestPosition} disabled={geoLoading} className="rounded-lg bg-bg-dark border-0 text-text-secondary hover:text-text">
              {geoLoading ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
              <span className="hidden sm:inline ml-1">Position</span>
            </Button>
          </div>
          {sug.length > 0 && <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-sm">{sug.map((s, i) => <button key={i} onClick={() => { setF(p => ({ ...p, coords: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }, address: s.display_name })); setAq(s.display_name); setSug([]); }} className="w-full text-left px-4 py-2.5 text-xs text-text-secondary hover:bg-bg-dark transition-colors">📍 {s.display_name}</button>)}</div>}
          {ge && <p className="text-[11px] text-red mt-1">{ge}</p>}
          {f.coords && <div className="flex items-center gap-2 mt-2"><span className="text-[11px] text-accent font-semibold">📍 {f.coords.lat.toFixed(4)}, {f.coords.lng.toFixed(4)}</span><button onClick={() => { setF({ ...f, coords: null, address: null }); setAq(''); }} className="text-[11px] text-text-muted hover:text-red underline">Supprimer</button></div>}
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Liens</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              <input type="url" value={f.website ?? ''} onChange={ev => setF({ ...f, website: ev.target.value || null })} placeholder="https://…" className={cn(inp, 'pl-9')} />
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              <input type="url" value={f.menu ?? ''} onChange={ev => setF({ ...f, menu: ev.target.value || null })} placeholder="https://…" className={cn(inp, 'pl-9')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} className="text-text-secondary hover:text-text">Annuler</Button>
          <button onClick={() => { if (f.name.trim()) onSave(f); }} disabled={!f.name.trim()} className="px-6 py-3 rounded-xl text-sm font-bold bg-accent text-white hover:bg-accent-dark disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed transition-colors active:scale-[0.97]">
            {e ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </section>
  );
}
