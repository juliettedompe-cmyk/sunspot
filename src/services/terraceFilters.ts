import type { TerraceWithSunInfo } from "@/types/terrace";
import type { Filters } from "@/types/filters";
import { calculateDistanceKm, type GeoPoint } from "./distance";

/**
 * Returns terraces that receive any sun (sunny or partial), or all if filter is off.
 */
export function filterBySunExposure(
  terraces: TerraceWithSunInfo[],
  sunnyOnly: boolean
): TerraceWithSunInfo[] {
  return sunnyOnly ? terraces.filter((t) => t.sunStatus !== "shady") : terraces;
}

/**
 * Returns terraces within the given radius from the user's position.
 */
export function filterByMaxDistanceKm(
  terraces: TerraceWithSunInfo[],
  userPosition: GeoPoint,
  maxKm: number
): TerraceWithSunInfo[] {
  return terraces.filter((t) => calculateDistanceKm(userPosition, t) <= maxKm);
}

/**
 * Returns terraces that will still be in sun for at least `minMinutes`.
 */
export function filterByMinSunRemaining(
  terraces: TerraceWithSunInfo[],
  minMinutes: number
): TerraceWithSunInfo[] {
  return terraces.filter(
    (t) => t.sunRemainingMinutes !== null && t.sunRemainingMinutes >= minMinutes
  );
}

/**
 * Returns a new array sorted by ascending distance from the given position.
 */
export function sortByDistance(
  terraces: TerraceWithSunInfo[],
  from: GeoPoint
): TerraceWithSunInfo[] {
  return [...terraces].sort(
    (a, b) => calculateDistanceKm(from, a) - calculateDistanceKm(from, b)
  );
}

/**
 * Applies all active filters and optionally sorts by distance.
 */
export function applyFilters(
  terraces: TerraceWithSunInfo[],
  filters: Filters,
  userPosition: GeoPoint | null
): TerraceWithSunInfo[] {
  let result = terraces;

  if (filters.sunExposure === "any-sun") {
    result = result.filter((t) => t.sunStatus !== "shady");
  } else if (filters.sunExposure === "sunny-only") {
    result = result.filter((t) => t.sunStatus === "sunny");
  }

  if (filters.minSunRemainingMinutes !== null) {
    result = filterByMinSunRemaining(result, filters.minSunRemainingMinutes);
  }

  if (filters.nearbyOnly && userPosition) {
    result = filterByMaxDistanceKm(result, userPosition, 1);
  }

  if (userPosition) {
    result = sortByDistance(result, userPosition);
  }

  return result;
}
