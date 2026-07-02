import type { Restaurant } from './types';

const STORAGE_KEY = 'quequonmange_data';
const CURRENT_VERSION = 3;

interface StorageSchema {
  version: number;
  restaurants: Restaurant[];
}

/**
 * Lit les restaurants depuis localStorage.
 * Retourne null si localStorage est vide ou indisponible.
 */
export function loadFromStorage(): Restaurant[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StorageSchema;
    if (!parsed || !Array.isArray(parsed.restaurants)) {
      console.warn('[storage] Données corrompues, reset');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const migrated = migrate(parsed);
    // Réécrire si migration appliquée
    if (migrated.version !== parsed.version) {
      saveToStorage(migrated.restaurants);
    }
    return migrated.restaurants;
  } catch {
    console.warn('[storage] Erreur de lecture localStorage');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage complètement indisponible
    }
    return null;
  }
}

/**
 * Sauvegarde les restaurants dans localStorage.
 * Échoue silencieusement si localStorage est plein ou indisponible.
 */
export function saveToStorage(restaurants: Restaurant[]): void {
  try {
    const data: StorageSchema = {
      version: CURRENT_VERSION,
      restaurants,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[storage] localStorage plein, écriture ignorée');
    } else {
      console.warn('[storage] Erreur d\'écriture localStorage');
    }
  }
}

/**
 * Applique les migrations séquentiellement.
 */
function migrate(data: StorageSchema): StorageSchema {
  let { version, restaurants } = data;

  // Migration v1 → v2 : ajout budget + coords
  if (version < 2) {
    restaurants = restaurants.map((r) => {
      const raw = r as unknown as Record<string, unknown>;
      return {
        ...r,
        budget: raw.budget !== undefined
          ? raw.budget as 1 | 2 | 3
          : 2 as const,
        coords: raw.coords !== undefined
          ? raw.coords as { lat: number; lng: number } | null
          : null,
      };
    });
    version = 2;
  }

  // Migration v2 → v3 : ajout website, address, menu
  if (version < 3) {
    restaurants = restaurants.map((r) => {
      const raw = r as unknown as Record<string, unknown>;
      return {
        ...r,
        website: raw.website !== undefined ? (raw.website as string | null) : null,
        address: raw.address !== undefined ? (raw.address as string | null) : null,
        menu: raw.menu !== undefined ? (raw.menu as string | null) : null,
      };
    });
    version = 3;
  }

  return { version, restaurants };
}
