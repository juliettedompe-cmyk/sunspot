"use client";

import { useMemo } from "react";
import type { TerraceWithSunInfo } from "@/types/terrace";
import { calculateDistanceKm, type GeoPoint } from "@/services/distance";

/**
 * Enriches terraces with the distance from the user's position.
 * Returns the original array unchanged when position is unavailable.
 */
export function useTerraceDistance(
  terraces: TerraceWithSunInfo[],
  userPosition: GeoPoint | null
): TerraceWithSunInfo[] {
  return useMemo(() => {
    if (!userPosition) return terraces;
    return terraces.map((t) => ({
      ...t,
      distanceKm: calculateDistanceKm(userPosition, t),
    }));
  }, [terraces, userPosition]);
}
