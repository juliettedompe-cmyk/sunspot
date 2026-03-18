import { describe, it, expect } from "vitest";
import {
  filterBySunExposure,
  filterByMaxDistanceKm,
  filterByMinSunRemaining,
  sortByDistance,
  applyFilters,
} from "../terraceFilters";
import type { TerraceWithSunInfo, SunStatus } from "@/types/terrace";
import type { Filters } from "@/types/filters";

function makeTerrace(
  id: string,
  lat: number,
  lng: number,
  sunStatus: SunStatus,
  sunRemainingMinutes: number | null = 60
): TerraceWithSunInfo {
  return {
    id,
    name: `Terrasse ${id}`,
    address: `${id} Rue Test, Paris`,
    lat,
    lng,
    orientation: 180,
    sunStatus,
    sunScore: sunStatus === "shady" ? 0 : 75,
    sunAzimuthDeg: 180,
    sunAltitudeDeg: 45,
    sunRemainingMinutes,
    sunUntil: sunRemainingMinutes !== null ? new Date("2024-06-21T16:00:00Z") : null,
    sunMessage: sunStatus === "shady" ? "À l'ombre" : "☀️ Plein soleil (4h+)",
  };
}

const TERRACE_FLORE      = makeTerrace("flore",      48.854, 2.333, "sunny",   120);
const TERRACE_CONSULAT   = makeTerrace("consulat",   48.886, 2.337, "shady",   null);
const TERRACE_REPUBLIQUE = makeTerrace("republique", 48.867, 2.363, "partial", 30);
const USER = { lat: 48.854, lng: 2.333 };

const ALL = [TERRACE_FLORE, TERRACE_CONSULAT, TERRACE_REPUBLIQUE];

describe("filterBySunExposure", () => {
  it("returns all terraces when sunnyOnly is false", () => {
    expect(filterBySunExposure(ALL, false)).toHaveLength(3);
  });

  it("excludes shady terraces when sunnyOnly is true", () => {
    const result = filterBySunExposure(ALL, true);
    expect(result).toHaveLength(2);
    result.forEach((t) => expect(t.sunStatus).not.toBe("shady"));
  });

  it("returns empty array when all terraces are shady", () => {
    const all_shady = ALL.map((t) => ({ ...t, sunStatus: "shady" as SunStatus }));
    expect(filterBySunExposure(all_shady, true)).toHaveLength(0);
  });

  it("does not mutate the original array", () => {
    const original = [...ALL];
    filterBySunExposure(ALL, true);
    expect(ALL).toEqual(original);
  });
});

describe("filterByMinSunRemaining", () => {
  it("includes terraces with enough sun remaining", () => {
    expect(filterByMinSunRemaining(ALL, 60)).toContainEqual(TERRACE_FLORE);
  });

  it("excludes terraces with not enough sun remaining", () => {
    // Republique has 30 min — filtered out at 60 min threshold
    expect(filterByMinSunRemaining(ALL, 60)).not.toContainEqual(TERRACE_REPUBLIQUE);
  });

  it("excludes shady terraces (null remaining)", () => {
    expect(filterByMinSunRemaining(ALL, 1)).not.toContainEqual(TERRACE_CONSULAT);
  });

  it("returns all non-shady terraces at threshold 0", () => {
    expect(filterByMinSunRemaining(ALL, 0)).toHaveLength(2);
  });
});

describe("filterByMaxDistanceKm", () => {
  it("includes terraces within the radius", () => {
    expect(filterByMaxDistanceKm(ALL, USER, 1)).toContainEqual(TERRACE_FLORE);
  });

  it("excludes terraces beyond the radius", () => {
    expect(filterByMaxDistanceKm(ALL, USER, 2)).not.toContainEqual(TERRACE_CONSULAT);
  });

  it("returns all terraces when radius is very large", () => {
    expect(filterByMaxDistanceKm(ALL, USER, 100)).toHaveLength(3);
  });
});

describe("sortByDistance", () => {
  it("sorts by ascending distance", () => {
    const sorted = sortByDistance(ALL, USER);
    expect(sorted[0].id).toBe("flore");
    expect(sorted[sorted.length - 1].id).toBe("consulat");
  });

  it("does not mutate the original array", () => {
    const original = [...ALL];
    sortByDistance(ALL, USER);
    expect(ALL).toEqual(original);
  });
});

describe("applyFilters", () => {
  const base: Filters = { sunExposure: "all", minSunRemainingMinutes: null, nearbyOnly: false };

  it("returns all terraces with default filters", () => {
    expect(applyFilters(ALL, base, null)).toHaveLength(3);
  });

  it("filters to any-sun", () => {
    const result = applyFilters(ALL, { ...base, sunExposure: "any-sun" }, null);
    expect(result).toHaveLength(2);
    result.forEach((t) => expect(t.sunStatus).not.toBe("shady"));
  });

  it("filters to sunny-only", () => {
    const result = applyFilters(ALL, { ...base, sunExposure: "sunny-only" }, null);
    expect(result).toHaveLength(1);
    expect(result[0].sunStatus).toBe("sunny");
  });

  it("filters by min sun remaining", () => {
    const result = applyFilters(ALL, { ...base, minSunRemainingMinutes: 60 }, null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("flore");
  });

  it("filters by nearby when user position is available", () => {
    const result = applyFilters(ALL, { ...base, nearbyOnly: true }, USER);
    expect(result).not.toContainEqual(TERRACE_CONSULAT);
  });

  it("ignores nearbyOnly when user position is null", () => {
    const result = applyFilters(ALL, { ...base, nearbyOnly: true }, null);
    expect(result).toHaveLength(3);
  });
});
