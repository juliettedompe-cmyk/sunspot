import type { TerraceWithSunInfo } from "@/types/terrace";
import type { Filters } from "@/types/filters";
import type { GeoPoint } from "./distance";
import {
  filterBySunExposure,
  filterByMaxDistanceKm,
  filterByMinSunRemaining,
  sortByDistance,
  applyFilters as _applyFilters,
} from "./terraceFilters";

// ── Named constants (single source of truth for business rules) ───────────────

/** Radius used by the "Autour de moi" nearby filter. */
export const NEARBY_RADIUS_KM = 1;

// ── Filter presets ────────────────────────────────────────────────────────────

/**
 * "Au soleil maintenant" — returns terraces with any sun (sunny or partial).
 */
export function filterInSunNow(terraces: TerraceWithSunInfo[]): TerraceWithSunInfo[] {
  return filterBySunExposure(terraces, true);
}

/**
 * "Encore au soleil dans X minutes" — returns terraces that will still
 * receive sun for at least `minutes` from the query time.
 */
export function filterStillSunnyIn(
  terraces: TerraceWithSunInfo[],
  minutes: number
): TerraceWithSunInfo[] {
  return filterByMinSunRemaining(terraces, minutes);
}

/**
 * "Autour de moi" — returns terraces within NEARBY_RADIUS_KM from the user.
 * No-op when userPosition is null.
 */
export function filterNearby(
  terraces: TerraceWithSunInfo[],
  userPosition: GeoPoint | null
): TerraceWithSunInfo[] {
  if (!userPosition) return terraces;
  return filterByMaxDistanceKm(terraces, userPosition, NEARBY_RADIUS_KM);
}

/**
 * Applies all UI filter state in the canonical order:
 *   1. Sun exposure level
 *   2. Minimum remaining sun
 *   3. Nearby radius
 *   4. Sort by distance (when user position is known)
 */
export function applyFilters(
  terraces: TerraceWithSunInfo[],
  filters: Filters,
  userPosition: GeoPoint | null
): TerraceWithSunInfo[] {
  return _applyFilters(terraces, filters, userPosition);
}

// Re-exports for callers that need the primitives directly.
export {
  filterBySunExposure,
  filterByMaxDistanceKm,
  filterByMinSunRemaining,
  sortByDistance,
};
