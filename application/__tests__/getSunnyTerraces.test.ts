import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Terrace } from "@/domain/terrace";

// Mock the repository before importing the use-case
vi.mock("@/infrastructure/terraceRepository", () => ({
  getAllTerraces: vi.fn(),
}));

import { getSunnyTerraces } from "../getSunnyTerraces";
import { getAllTerraces } from "@/infrastructure/terraceRepository";

const mockGetAllTerraces = vi.mocked(getAllTerraces);

const FIXTURE_TERRACES: Terrace[] = [
  {
    id: "1",
    name: "Terrasse Sud",
    address: "1 Rue Test, Paris",
    lat: 48.856,
    lng: 2.352,
    orientation: 180, // faces south
  },
  {
    id: "2",
    name: "Terrasse Nord",
    address: "2 Rue Test, Paris",
    lat: 48.857,
    lng: 2.353,
    orientation: 0, // faces north
  },
  {
    id: "3",
    name: "Terrasse Est",
    address: "3 Rue Test, Paris",
    lat: 48.858,
    lng: 2.354,
    orientation: 90, // faces east
  },
];

describe("getSunnyTerraces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllTerraces.mockResolvedValue(FIXTURE_TERRACES);
  });

  it("enriches terraces with sun info", async () => {
    // Summer solstice noon UTC+2 → 10:00 UTC — sun is high and roughly south
    const summerNoon = new Date("2024-06-21T10:00:00Z");
    const result = await getSunnyTerraces(summerNoon);

    expect(result).toHaveLength(3);
    result.forEach((t) => {
      expect(t).toHaveProperty("isSunny");
      expect(t).toHaveProperty("sunAzimuthDeg");
      expect(t).toHaveProperty("sunAltitudeDeg");
    });
  });

  it("marks south-facing terrace as sunny at noon in summer", async () => {
    const summerNoon = new Date("2024-06-21T10:00:00Z");
    const result = await getSunnyTerraces(summerNoon);
    const terrasse = result.find((t) => t.id === "1")!;
    expect(terrasse.isSunny).toBe(true);
  });

  it("marks north-facing terrace as not sunny at noon in summer", async () => {
    const summerNoon = new Date("2024-06-21T10:00:00Z");
    const result = await getSunnyTerraces(summerNoon);
    const terrasse = result.find((t) => t.id === "2")!;
    expect(terrasse.isSunny).toBe(false);
  });

  it("marks all terraces as not sunny at midnight", async () => {
    const midnight = new Date("2024-06-21T00:00:00Z");
    const result = await getSunnyTerraces(midnight);
    result.forEach((t) => {
      expect(t.isSunny).toBe(false);
    });
  });

  it("preserves original terrace fields", async () => {
    const date = new Date("2024-06-21T10:00:00Z");
    const result = await getSunnyTerraces(date);
    const first = result[0];
    expect(first.id).toBe(FIXTURE_TERRACES[0].id);
    expect(first.name).toBe(FIXTURE_TERRACES[0].name);
    expect(first.orientation).toBe(FIXTURE_TERRACES[0].orientation);
  });

  it("uses the same sun position for all terraces (single getSunPosition call per batch)", async () => {
    const date = new Date("2024-06-21T10:00:00Z");
    const result = await getSunnyTerraces(date);
    // All terraces should have the same sun position values
    const azimuth = result[0].sunAzimuthDeg;
    const altitude = result[0].sunAltitudeDeg;
    result.forEach((t) => {
      expect(t.sunAzimuthDeg).toBe(azimuth);
      expect(t.sunAltitudeDeg).toBe(altitude);
    });
  });
});
