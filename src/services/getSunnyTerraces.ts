import { getEnrichedTerraces } from "./terraceService";
import type { TerraceWithSunInfo } from "@/types/terrace";

/**
 * @deprecated Use {@link getEnrichedTerraces} from terraceService directly.
 * Re-exported here for backward compatibility with existing call sites and tests.
 */
export async function getSunnyTerraces(date: Date): Promise<TerraceWithSunInfo[]> {
  return getEnrichedTerraces(date);
}
