import { GearItem } from '../../types';

/**
 * Personal gear inventory — stored in localStorage as a single JSON array.
 *
 * The list is small (a typical pumpfoiler has fewer than 20 items) and
 * never needs querying, so we keep it in a single key. Photos attached
 * to a gear item are stored separately in the IndexedDB media store.
 */

const KEY = 'pumpfoil_gear';

export function listGear(): GearItem[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as GearItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGearItem(item: GearItem): void {
  const all = listGear();
  const idx = all.findIndex(g => g.id === item.id);
  if (idx >= 0) {
    all[idx] = item;
  } else {
    all.push(item);
  }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteGearItem(id: string): void {
  const all = listGear().filter(g => g.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function newGearId(): string {
  return `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
