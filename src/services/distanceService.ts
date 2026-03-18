import { calculateDistanceKm, type GeoPoint } from "./distance";
import type { Terrace } from "@/types/terrace";

/**
 * Enriches an array of terraces with the distance from the user's position.
 * Returns the original array unchanged when position is null (user hasn't
 * granted geolocation or hasn't clicked "Autour de moi").
 *
 * The generic constraint ensures callers keep their richer type (e.g.
 * TerraceWithSunInfo) after enrichment — distanceKm is defined on Terrace.
 */
export function enrichWithDistance<T extends Terrace & { distanceKm?: number }>(
  terraces: T[],
  userPosition: GeoPoint | null
): T[] {
  if (!userPosition) return terraces;
  return terraces.map((t) => ({
    ...t,
    distanceKm: calculateDistanceKm(userPosition, t),
  }));
}

// Re-export so callers can import everything distance-related from one place.
export { calculateDistanceKm, type GeoPoint };
