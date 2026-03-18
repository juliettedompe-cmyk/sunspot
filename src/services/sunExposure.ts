import SunCalc from "suncalc";
import type { SunStatus } from "@/types/terrace";

export interface SunPosition {
  /** Compass bearing in degrees: 0=N, 90=E, 180=S, 270=W */
  azimuthDeg: number;
  /** Degrees above the horizon. Negative means below horizon. */
  altitudeDeg: number;
}

const MIN_SUN_ALTITUDE_DEG = 5;
const SUNNY_MAX_ANGULAR_DIFF_DEG = 60;
const PARTIAL_MAX_ANGULAR_DIFF_DEG = 90;
const SUN_SCAN_STEP_MINUTES = 5;
const SUN_SCAN_MAX_MINUTES = 240;

/**
 * Returns the sun position at a given time and location.
 *
 * SunCalc's azimuth is in radians, measured from south, clockwise.
 * We convert to a standard compass bearing (0=N, 90=E, 180=S, 270=W).
 */
export function getSunPosition(lat: number, lng: number, date: Date): SunPosition {
  const pos = SunCalc.getPosition(date, lat, lng);
  const azimuthDeg = ((pos.azimuth * (180 / Math.PI)) + 180 + 360) % 360;
  const altitudeDeg = pos.altitude * (180 / Math.PI);
  return { azimuthDeg, altitudeDeg };
}

/**
 * Returns the sun exposure status of a terrace at a given sun position.
 *
 * - sunny:   sun is high and well within the terrace's frontal arc (< 60°)
 * - partial: sun is in the arc but grazing the side (60°–90°)
 * - shady:   sun is below horizon or outside the arc (≥ 90°)
 */
export function getSunStatus(terraceOrientation: number, sun: SunPosition): SunStatus {
  if (sun.altitudeDeg <= MIN_SUN_ALTITUDE_DEG) return "shady";

  const diff = Math.abs(sun.azimuthDeg - terraceOrientation);
  const angularDiff = diff > 180 ? 360 - diff : diff;

  if (angularDiff < SUNNY_MAX_ANGULAR_DIFF_DEG) return "sunny";
  if (angularDiff < PARTIAL_MAX_ANGULAR_DIFF_DEG) return "partial";
  return "shady";
}

/**
 * Returns how many minutes of sun the terrace still has from the given time.
 * Scans forward in 5-minute steps up to 4 hours.
 * Returns null if the terrace is already shady.
 */
export function estimateSunRemainingMinutes(
  terraceOrientation: number,
  lat: number,
  lng: number,
  fromDate: Date
): number | null {
  const current = getSunPosition(lat, lng, fromDate);
  if (getSunStatus(terraceOrientation, current) === "shady") return null;

  for (
    let minutes = SUN_SCAN_STEP_MINUTES;
    minutes <= SUN_SCAN_MAX_MINUTES;
    minutes += SUN_SCAN_STEP_MINUTES
  ) {
    const future = new Date(fromDate.getTime() + minutes * 60_000);
    if (getSunStatus(terraceOrientation, getSunPosition(lat, lng, future)) === "shady") {
      return minutes;
    }
  }

  return SUN_SCAN_MAX_MINUTES;
}

/**
 * Returns true if the terrace receives any direct sun (sunny or partial).
 * Kept for backwards compatibility with existing tests.
 */
export function isTerraceSunny(terraceOrientation: number, sun: SunPosition): boolean {
  return getSunStatus(terraceOrientation, sun) !== "shady";
}
