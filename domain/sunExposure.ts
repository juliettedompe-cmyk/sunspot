import SunCalc from "suncalc";

export interface SunPosition {
  /** Compass bearing in degrees: 0=N, 90=E, 180=S, 270=W */
  azimuthDeg: number;
  /** Degrees above the horizon. Negative means below horizon. */
  altitudeDeg: number;
}

/**
 * Returns the sun position at a given time and location.
 *
 * SunCalc's azimuth is in radians, measured from south, clockwise.
 * We convert to a standard compass bearing (0=N, 90=E, 180=S, 270=W).
 */
export function getSunPosition(lat: number, lng: number, date: Date): SunPosition {
  const pos = SunCalc.getPosition(date, lat, lng);

  // SunCalc: azimuth = 0 is south, positive = west, negative = east (radians)
  // Convert to compass degrees: south + 180 → north reference, then flip east/west
  const azimuthDeg = ((pos.azimuth * (180 / Math.PI)) + 180 + 360) % 360;
  const altitudeDeg = pos.altitude * (180 / Math.PI);

  return { azimuthDeg, altitudeDeg };
}

/**
 * Returns true if a terrace is in direct sunlight at the given sun position.
 *
 * Rules:
 *   1. Sun must be more than 5° above the horizon (filters out near-horizon light)
 *   2. The angular difference between the sun's compass bearing and the terrace's
 *      facing direction must be less than 90° (sun is within the terrace's front arc)
 */
export function isTerraceSunny(
  terraceOrientation: number,
  sun: SunPosition
): boolean {
  if (sun.altitudeDeg <= 5) return false;

  const diff = Math.abs(sun.azimuthDeg - terraceOrientation);
  const angularDiff = diff > 180 ? 360 - diff : diff;

  return angularDiff < 90;
}
