import { supabase } from "./supabaseClient";
import { toTerrace } from "./terraceMapping";
import type { TerraceRow } from "./terraceRow";
import type { Terrace } from "@/types/terrace";

/**
 * Fetches all active terraces from the database.
 * Queries the `terraces` table directly — explicit latitude/longitude columns
 * mean no PostGIS parsing or helper view is needed.
 */
export async function getAllTerraces(): Promise<Terrace[]> {
  const { data, error } = await supabase
    .from("terraces")
    .select(
      "id, name, address, latitude, longitude, orientation, open_hours, " +
      "venue_type, source, source_id, is_active, created_at, updated_at"
    )
    .eq("is_active", true)
    .returns<TerraceRow[]>();

  if (error) {
    throw new Error(`Failed to fetch terraces: ${error.message}`);
  }

  return (data ?? []).map(toTerrace);
}
