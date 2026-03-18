import { describe, it, expect } from "vitest";
import {
  NEARBY_RADIUS_KM,
  filterInSunNow,
  filterStillSunnyIn,
  filterNearby,
  applyFilters,
} from "../filterService";
import type { TerraceWithSunInfo, SunStatus } from "@/types/terrace";
import type { Filters } from "@/types/filters";

// ── Fixture factory ───────────────────────────────────────────────────────────

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
    sunAltitudeDeg: sunStatus === "shady" ? -10 : 45,
    sunRemainingMinutes,
    sunUntil: sunRemainingMinutes !== null ? new Date("2024-06-21T16:00:00Z") : null,
    sunMessage: sunStatus === "shady" ? "À l'ombre" : "☀️ Plein soleil (4h+)",
  };
}

// Flore: sunny, 120 min remaining, close to user
const TERRACE_FLORE      = makeTerrace("flore",      48.854, 2.333, "sunny",   120);
// Consulat: shady, in Montmartre — far from user
const TERRACE_CONSULAT   = makeTerrace("consulat",   48.886, 2.337, "shady",   null);
// République: partial, 30 min remaining, 1.5 km away
const TERRACE_REPUBLIQUE = makeTerrace("republique", 48.867, 2.363, "partial", 30);

const USER = { lat: 48.854, lng: 2.333 }; // same as Flore
const ALL  = [TERRACE_FLORE, TERRACE_CONSULAT, TERRACE_REPUBLIQUE];

const BASE_FILTERS: Filters = {
  sunExposure: "all",
  minSunRemainingMinutes: null,
  nearbyOnly: false,
};

// ── NEARBY_RADIUS_KM ──────────────────────────────────────────────────────────

describe("NEARBY_RADIUS_KM", () => {
  it("equals 1", () => {
    expect(NEARBY_RADIUS_KM).toBe(1);
  });
});

// ── filterInSunNow ────────────────────────────────────────────────────────────

describe("filterInSunNow", () => {
  it("excludes shady terraces", () => {
    const result = filterInSunNow(ALL);
    result.forEach((t) => expect(t.sunStatus).not.toBe("shady"));
  });

  it("includes sunny terraces", () => {
    expect(filterInSunNow(ALL)).toContainEqual(TERRACE_FLORE);
  });

  it("includes partial terraces", () => {
    expect(filterInSunNow(ALL)).toContainEqual(TERRACE_REPUBLIQUE);
  });

  it("returns empty array when all terraces are shady", () => {
    const allShady = ALL.map((t) => ({ ...t, sunStatus: "shady" as SunStatus, sunRemainingMinutes: null, sunUntil: null }));
    expect(filterInSunNow(allShady)).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const copy = [...ALL];
    filterInSunNow(ALL);
    expect(ALL).toEqual(copy);
  });
});

// ── filterStillSunnyIn ────────────────────────────────────────────────────────

describe("filterStillSunnyIn", () => {
  it("includes terraces with enough sun remaining", () => {
    expect(filterStillSunnyIn(ALL, 60)).toContainEqual(TERRACE_FLORE); // 120 min ≥ 60
  });

  it("excludes terraces with insufficient sun remaining", () => {
    expect(filterStillSunnyIn(ALL, 60)).not.toContainEqual(TERRACE_REPUBLIQUE); // 30 min < 60
  });

  it("excludes shady terraces (null remaining)", () => {
    expect(filterStillSunnyIn(ALL, 1)).not.toContainEqual(TERRACE_CONSULAT);
  });

  it("returns all lit terraces at threshold 0", () => {
    const result = filterStillSunnyIn(ALL, 0);
    expect(result).toHaveLength(2);
    result.forEach((t) => expect(t.sunRemainingMinutes).not.toBeNull());
  });
});

// ── filterNearby ──────────────────────────────────────────────────────────────

describe("filterNearby", () => {
  it("is a no-op when userPosition is null", () => {
    expect(filterNearby(ALL, null)).toHaveLength(3);
  });

  it("includes terraces within NEARBY_RADIUS_KM", () => {
    expect(filterNearby(ALL, USER)).toContainEqual(TERRACE_FLORE);
  });

  it("excludes terraces beyond NEARBY_RADIUS_KM", () => {
    const result = filterNearby(ALL, USER);
    expect(result).not.toContainEqual(TERRACE_CONSULAT);
  });
});

// ── applyFilters ──────────────────────────────────────────────────────────────

describe("applyFilters", () => {
  it("returns all terraces with default filters and no user position", () => {
    expect(applyFilters(ALL, BASE_FILTERS, null)).toHaveLength(3);
  });

  it("filters to any-sun (sunExposure='any-sun')", () => {
    const result = applyFilters(ALL, { ...BASE_FILTERS, sunExposure: "any-sun" }, null);
    expect(result).toHaveLength(2);
    result.forEach((t) => expect(t.sunStatus).not.toBe("shady"));
  });

  it("filters to sunny-only (sunExposure='sunny-only')", () => {
    const result = applyFilters(ALL, { ...BASE_FILTERS, sunExposure: "sunny-only" }, null);
    expect(result).toHaveLength(1);
    expect(result[0].sunStatus).toBe("sunny");
  });

  it("filters by minSunRemainingMinutes", () => {
    const result = applyFilters(ALL, { ...BASE_FILTERS, minSunRemainingMinutes: 60 }, null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("flore");
  });

  it("applies nearbyOnly when user position is known", () => {
    const result = applyFilters(ALL, { ...BASE_FILTERS, nearbyOnly: true }, USER);
    expect(result).not.toContainEqual(TERRACE_CONSULAT);
  });

  it("ignores nearbyOnly when user position is null", () => {
    expect(applyFilters(ALL, { ...BASE_FILTERS, nearbyOnly: true }, null)).toHaveLength(3);
  });

  it("combines sun exposure and min remaining filters", () => {
    const filters: Filters = { sunExposure: "any-sun", minSunRemainingMinutes: 60, nearbyOnly: false };
    const result = applyFilters(ALL, filters, null);
    // only Flore: sunny, 120 min
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("flore");
  });
});
