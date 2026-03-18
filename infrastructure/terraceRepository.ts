import { supabase } from "./supabaseClient";
import type { Terrace } from "@/domain/terrace";

/**
 * Fetches all terraces from the database.
 * Uses the `terraces_with_coords` view which exposes lat/lng as plain floats.
 */
export async function getAllTerraces(): Promise<Terrace[]> {
  const { data, error } = await supabase
    .from("terraces_with_coords")
    .select("id, name, address, lat, lng, orientation, open_hours");

  if (error) {
    throw new Error(`Failed to fetch terraces: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    address: row.address as string,
    lat: row.lat as number,
    lng: row.lng as number,
    orientation: row.orientation as number,
    openHours: row.open_hours ?? undefined,
  }));
}
