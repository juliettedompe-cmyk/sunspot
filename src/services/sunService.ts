import {
  getSunPosition,
  getSunStatus,
  estimateSunRemainingMinutes,
} from "./sunExposure";
import type { SunInfo } from "@/types/sun";
import type { SunStatus } from "@/types/terrace";

// ── MVP Hypotheses ────────────────────────────────────────────────────────────
//
// H1. FLAT TERRAIN
//     No occlusion from buildings, hills, or trees is modelled.
//     The score and status are purely geometric (sun angle vs. facade direction).
//
// H2. FACADE ORIENTATION = EXPOSURE
//     A terrace receives "full sun" when the sun is within ±60° of the stated
//     orientation. This ignores awnings, umbrellas, or partial coverage.
//     The threshold (60° sunny / 90° partial) is tunable in sunExposure.ts.
//
// H3. PER-TERRACE SUN POSITION
//     getSunPosition() is called with each terrace's own lat/lng.
//     For a city-scale dataset (Paris) the difference is < 0.01°, but it is
//     correct and cheap to compute.
//
// H4. REMAINING-SUN SCAN
//     estimateSunRemainingMinutes() steps forward in 5-min increments up to
//     4 hours (240 min). If the terrace is still sunny after 4 h, sunUntil is
//     set to queryDate + 240 min and the message shows "(4h+)".
//
// H5. ALTITUDE THRESHOLD
//     Sun below 5° is treated as "shady" regardless of azimuth, to account
//     for atmospheric refraction and rough-horizon effects.
//
// H6. SCORE FORMULA
//     score = angularFactor × altitudeFactor × 100
//     angularFactor = (90 − angularDiff) / 90   (capped; 0 when shady)
//     altitudeFactor = clamp((alt − 5°) / 55°, 0, 1)
//     Not a radiometric measure — replace with solar irradiance model later.
//
// ─────────────────────────────────────────────────────────────────────────────

const SUN_SCAN_MAX_MINUTES = 240; // must match sunExposure.ts

/**
 * Computes the full SunInfo for a terrace at a given moment.
 * This is the single entry point for all sun-enrichment logic.
 */
export function computeSunInfo(
  orientation: number,
  lat: number,
  lng: number,
  date: Date
): SunInfo {
  const sunPos = getSunPosition(lat, lng, date);
  const status = getSunStatus(orientation, sunPos);
  const remainingMinutes = estimateSunRemainingMinutes(orientation, lat, lng, date);

  const sunUntil =
    remainingMinutes !== null
      ? new Date(date.getTime() + remainingMinutes * 60_000)
      : null;

  return {
    status,
    score: computeSunScore(orientation, sunPos.azimuthDeg, sunPos.altitudeDeg, status),
    sunUntil,
    message: buildSunMessage(status, sunUntil, remainingMinutes),
    azimuthDeg: sunPos.azimuthDeg,
    altitudeDeg: sunPos.altitudeDeg,
  };
}

// ── Exported helpers (testable individually) ─────────────────────────────────

/**
 * Computes a sun quality score from 0 (shady) to 100 (perfect sun).
 *
 * angularFactor  = (90 − angularDiff) / 90  → 1.0 when aligned, 0.0 at ≥ 90°
 * altitudeFactor = clamp((alt − 5°) / 55°)  → 0 at horizon, 1.0 at 60°+
 * score = round(angularFactor × altitudeFactor × 100)
 */
export function computeSunScore(
  orientation: number,
  azimuthDeg: number,
  altitudeDeg: number,
  status: SunStatus
): number {
  if (status === "shady") return 0;

  const diff = Math.abs(azimuthDeg - orientation);
  const angularDiff = diff > 180 ? 360 - diff : diff;

  const angularFactor = Math.max(0, (90 - angularDiff) / 90);
  const altitudeFactor = Math.min(1, Math.max(0, (altitudeDeg - 5) / 55));

  return Math.round(angularFactor * altitudeFactor * 100);
}

/**
 * Builds a human-readable French sun status message.
 *
 * Examples:
 *   "☀️ Plein soleil jusqu'à 18h30"
 *   "☀️ Plein soleil (4h+)"
 *   "🌤 Partiellement ensoleillé"
 *   "À l'ombre"
 */
export function buildSunMessage(
  status: SunStatus,
  sunUntil: Date | null,
  remainingMinutes: number | null
): string {
  if (status === "shady") return "À l'ombre";

  const icon  = status === "sunny" ? "☀️" : "🌤";
  const label = status === "sunny" ? "Plein soleil" : "Partiellement ensoleillé";

  if (!sunUntil) return `${icon} ${label}`;

  if (remainingMinutes !== null && remainingMinutes >= SUN_SCAN_MAX_MINUTES) {
    return `${icon} ${label} (4h+)`;
  }

  return `${icon} ${label} jusqu'à ${formatTime(sunUntil)}`;
}

/** Formats a Date as "HHhMM", e.g. "18h30". Locale-independent. */
function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}
