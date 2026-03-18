import { supabase } from "./supabaseClient";
import type { TerraceRow } from "./types";
import type { Terrace } from "@/domain/terrace";

/**
 * Fetches all terraces from the database.
 * Uses the `terraces_with_coords` view which exposes lat/lng as plain floats.
 */
export async function getAllTerraces(): Promise<Terrace[]> {
  const { data, error } = await supabase
    .from("terraces_with_coords")
    .select("id, name, address, lat, lng, orientation, open_hours")
    .returns<TerraceRow[]>();

  if (error) {
    throw new Error(`Failed to fetch terraces: ${error.message}`);
  }

  return (data ?? []).map(toTerrace);
}

function toTerrace(row: TerraceRow): Terrace {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    orientation: row.orientation,
    openHours: row.open_hours ?? undefined,
  };
}
