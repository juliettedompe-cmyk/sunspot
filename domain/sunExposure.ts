import SunCalc from "suncalc";

export interface SunPosition {
  /** Compass bearing in degrees: 0=N, 90=E, 180=S, 270=W */
  azimuthDeg: number;
  /** Degrees above the horizon. Negative means below horizon. */
  altitudeDeg: number;
}

/** Sun must be strictly above this altitude (degrees) to illuminate a terrace. */
const MIN_SUN_ALTITUDE_DEG = 5;

/** Maximum angular difference between sun azimuth and terrace orientation for sun exposure. */
const MAX_ANGULAR_DIFF_DEG = 90;

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
 *   1. Sun must be more than MIN_SUN_ALTITUDE_DEG above the horizon
 *   2. The angular difference between the sun's compass bearing and the terrace's
 *      facing direction must be less than MAX_ANGULAR_DIFF_DEG
 */
export function isTerraceSunny(
  terraceOrientation: number,
  sun: SunPosition
): boolean {
  if (sun.altitudeDeg <= MIN_SUN_ALTITUDE_DEG) return false;

  const diff = Math.abs(sun.azimuthDeg - terraceOrientation);
  const angularDiff = diff > 180 ? 360 - diff : diff;

  return angularDiff < MAX_ANGULAR_DIFF_DEG;
}
