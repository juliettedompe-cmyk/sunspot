export interface Terrace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Direction the terrace faces, in degrees (0=N, 90=E, 180=S, 270=W) */
  orientation: number;
  openHours?: string;
}

/** Exposure level of a terrace at a given moment. */
export type SunStatus = "sunny" | "partial" | "shady";

export interface TerraceWithSunInfo extends Terrace {
  sunStatus: SunStatus;
  /** Composite sun quality score 0–100. See SunInfo.score for the formula. */
  sunScore: number;
  sunAzimuthDeg: number;
  sunAltitudeDeg: number;
  /** Minutes of sun remaining. null if currently shady. */
  sunRemainingMinutes: number | null;
  /** When the current sun exposure ends. null if shady. Approximate when ≥ 4 h. */
  sunUntil: Date | null;
  /** User-facing French summary, e.g. "☀️ Plein soleil jusqu'à 18h30". */
  sunMessage: string;
  /** Distance from the user in km. Undefined when user position is unknown. */
  distanceKm?: number;
}
