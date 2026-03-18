import type { TerraceRow } from "./terraceRow";
import type { Terrace } from "@/types/terrace";

/**
 * Maps a raw DB row to the domain Terrace type.
 * Responsible for: field renaming, null → undefined coercion, and excluding
 * DB-only fields (venue_type, source, is_active, timestamps).
 */
export function toTerrace(row: TerraceRow): Terrace {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: row.latitude,
    lng: row.longitude,
    orientation: row.orientation,
    openHours: row.open_hours ?? undefined,
  };
}
