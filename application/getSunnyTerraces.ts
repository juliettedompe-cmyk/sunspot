import { getAllTerraces } from "@/infrastructure/terraceRepository";
import { getSunPosition, isTerraceSunny } from "@/domain/sunExposure";
import type { TerraceWithSunInfo } from "@/domain/terrace";

// Paris centroid — sun position does not vary meaningfully across the city
const PARIS = { lat: 48.8566, lng: 2.3522 };

/**
 * Fetches all terraces and enriches each with sun exposure info for the given datetime.
 * Single DB round-trip; sun computation is in-process.
 */
export async function getSunnyTerraces(date: Date): Promise<TerraceWithSunInfo[]> {
  const terraces = await getAllTerraces();
  const sun = getSunPosition(PARIS.lat, PARIS.lng, date);

  return terraces.map((t) => ({
    ...t,
    isSunny: isTerraceSunny(t.orientation, sun),
    sunAzimuthDeg: sun.azimuthDeg,
    sunAltitudeDeg: sun.altitudeDeg,
  }));
}
