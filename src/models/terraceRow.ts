/**
 * Raw row returned by a SELECT on the `terraces` table.
 * Mirrors the SQL schema exactly — only the columns we SELECT are listed.
 * The `geom` column is omitted: lat/lng are plain floats, no PostGIS parsing needed.
 */
export interface TerraceRow {
  id: string;
  name: string;
  address: string;
  /** WGS-84 latitude (DOUBLE PRECISION in DB) */
  latitude: number;
  /** WGS-84 longitude (DOUBLE PRECISION in DB) */
  longitude: number;
  /** Degrees the terrace faces: 0=N, 90=E, 180=S, 270=W */
  orientation: number;
  open_hours: string | null;
  venue_type: string;
  source: string;
  source_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
