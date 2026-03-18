import type { SunStatus } from "./terrace";

/**
 * Full solar exposure result for a terrace at a specific moment.
 * Produced by sunService.computeSunInfo() — the single source of truth
 * for all sun-related data in the pipeline.
 */
export interface SunInfo {
  /** Categorical exposure level. */
  status: SunStatus;

  /**
   * Composite quality score from 0 (shady) to 100 (perfect sun).
   *
   * Formula (MVP): angularFactor × altitudeFactor × 100
   *   angularFactor = (90 − angularDiff) / 90   → 1.0 when aligned, 0 at ≥ 90°
   *   altitudeFactor = clamp((alt − 5°) / 55°)  → 0 near horizon, 1 at 60°+
   *
   * Not a radiometric measure — a geometric proxy only.
   */
  score: number;

  /**
   * When the current exposure level ends.
   * null  → terrace is already shady.
   * date  → computed by scanning forward in 5-min steps up to 4 h.
   *         If sun persists beyond 4 h, this is an approximation (≥ queryDate + 4h).
   */
  sunUntil: Date | null;

  /**
   * User-facing French summary.
   * Examples:
   *   "☀️ Plein soleil jusqu'à 18h30"
   *   "☀️ Plein soleil (4h+)"
   *   "🌤 Partiellement ensoleillé"
   *   "À l'ombre"
   */
  message: string;

  /** Solar azimuth in compass degrees (0 = N, 90 = E, 180 = S, 270 = W). */
  azimuthDeg: number;

  /** Solar altitude above the horizon in degrees. Negative = below horizon. */
  altitudeDeg: number;
}
