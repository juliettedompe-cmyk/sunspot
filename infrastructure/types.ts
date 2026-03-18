/**
 * Raw row returned by the `terraces_with_coords` Supabase view.
 * Mirrors the SQL view exactly — lat/lng are plain floats (no PostGIS parsing needed).
 */
export interface TerraceRow {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  orientation: number;
  open_hours: string | null;
}
