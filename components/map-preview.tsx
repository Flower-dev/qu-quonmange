import { cn } from '@/lib/utils';

function bb(lat: number, lng: number) { return [(lng - 0.005).toFixed(6), (lat - 0.005).toFixed(6), (lng + 0.005).toFixed(6), (lat + 0.005).toFixed(6)].join(','); }

export function MapPreview({ coords, address, className }: { coords: { lat: number; lng: number }; address?: string | null; className?: string }) {
  const osm = address ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}` : `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=16`;
  return (
    <a href={osm} target="_blank" rel="noopener noreferrer" className={cn('group block w-full h-40 rounded-xl overflow-hidden border border-border hover:border-accent/30 transition-colors', className)}>
      <div className="absolute inset-0 z-10 pointer-events-none" />
      <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${bb(coords.lat, coords.lng)}&layer=mapnik&marker=${coords.lat},${coords.lng}`} title="Carte" className="w-full h-full border-0 pointer-events-none" loading="lazy" />
      <div className="absolute bottom-0 left-0 right-0 z-10 h-12 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
      <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
        <svg className="w-3 h-3 text-accent shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
        <span className="text-[11px] text-text font-semibold truncate">{address ?? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`}</span>
      </div>
    </a>
  );
}
