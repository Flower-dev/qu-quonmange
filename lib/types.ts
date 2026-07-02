export interface Restaurant {
  id: string;
  name: string;
  category: string;
  description: string;
  emoji: string;
  appreciation: number;
  recurrence: number;
  budget: 1 | 2 | 3;
  coords: { lat: number; lng: number } | null;
  website: string | null;
  address: string | null;
  menu: string | null;
}

export interface Filters {
  categories: string[];
  budget: (1 | 2 | 3)[];
  maxDistance: number | null;
  maxRecurrence: number | null;
}

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  budget: [],
  maxDistance: null,
  maxRecurrence: null,
};
