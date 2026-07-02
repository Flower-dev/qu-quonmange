import { cn } from '@/lib/utils';
import { haversineDistance, formatDistance } from '@/lib/distance';

export function DistanceBadge({ restaurantCoords, userPosition, className }: {
  restaurantCoords: { lat: number; lng: number } | null; userPosition: { lat: number; lng: number } | null; className?: string;
}) {
  if (!restaurantCoords || !userPosition) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-px rounded text-[11px] font-semibold border border-border text-text-secondary bg-bg-dark', className)}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
      {formatDistance(haversineDistance(userPosition, restaurantCoords))}
    </span>
  );
}
