import { getAllTerraces } from "@/models/terraceRepository";
import { computeSunInfo } from "./sunService";
import type { TerraceWithSunInfo } from "@/types/terrace";

/**
 * Fetches all active terraces from the database and enriches each one with
 * solar exposure data computed for the given date/time.
 *
 * Pipeline:
 *   1. Single DB round-trip via terraceRepository
 *   2. Per-terrace solar computation (pure JS, no I/O) via sunService
 *   3. sunRemainingMinutes derived from sunUntil for UI compatibility
 *
 * This is the primary service consumed by terraceController.
 */
export async function getEnrichedTerraces(date: Date): Promise<TerraceWithSunInfo[]> {
  const terraces = await getAllTerraces();

  return terraces.map((t) => {
    const sun = computeSunInfo(t.orientation, t.lat, t.lng, date);

    return {
      ...t,
      sunStatus:           sun.status,
      sunScore:            sun.score,
      sunAzimuthDeg:       sun.azimuthDeg,
      sunAltitudeDeg:      sun.altitudeDeg,
      sunRemainingMinutes: sun.sunUntil !== null
        ? Math.round((sun.sunUntil.getTime() - date.getTime()) / 60_000)
        : null,
      sunUntil:            sun.sunUntil,
      sunMessage:          sun.message,
    };
  });
}
