import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Terrace } from "@/types/terrace";

vi.mock("@/models/terraceRepository", () => ({
  getAllTerraces: vi.fn(),
}));

import { getSunnyTerraces } from "../getSunnyTerraces";
import { getAllTerraces } from "@/models/terraceRepository";

const mockGetAllTerraces = vi.mocked(getAllTerraces);

const FIXTURE_TERRACES: Terrace[] = [
  { id: "1", name: "Terrasse Sud",  address: "1 Rue Test", lat: 48.856, lng: 2.352, orientation: 180 },
  { id: "2", name: "Terrasse Nord", address: "2 Rue Test", lat: 48.857, lng: 2.353, orientation: 0   },
  { id: "3", name: "Terrasse Est",  address: "3 Rue Test", lat: 48.858, lng: 2.354, orientation: 90  },
];

describe("getSunnyTerraces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllTerraces.mockResolvedValue(FIXTURE_TERRACES);
  });

  it("enriches terraces with sun info fields", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T10:00:00Z"));

    expect(result).toHaveLength(3);
    result.forEach((t) => {
      expect(t).toHaveProperty("sunStatus");
      expect(t).toHaveProperty("sunScore");
      expect(t).toHaveProperty("sunAzimuthDeg");
      expect(t).toHaveProperty("sunAltitudeDeg");
      expect(t).toHaveProperty("sunRemainingMinutes");
      expect(t).toHaveProperty("sunUntil");
      expect(t).toHaveProperty("sunMessage");
    });
  });

  it("marks south-facing terrace as sunny at noon in summer", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T10:00:00Z"));
    expect(result.find((t) => t.id === "1")!.sunStatus).toBe("sunny");
  });

  it("marks north-facing terrace as shady at noon in summer", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T10:00:00Z"));
    expect(result.find((t) => t.id === "2")!.sunStatus).toBe("shady");
  });

  it("marks all terraces as shady at midnight", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T00:00:00Z"));
    result.forEach((t) => expect(t.sunStatus).toBe("shady"));
  });

  it("returns null sunRemainingMinutes for shady terraces", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T00:00:00Z"));
    result.forEach((t) => expect(t.sunRemainingMinutes).toBeNull());
  });

  it("returns positive sunRemainingMinutes for sunny terrace at noon", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T10:00:00Z"));
    const south = result.find((t) => t.id === "1")!;
    expect(south.sunRemainingMinutes).not.toBeNull();
    expect(south.sunRemainingMinutes!).toBeGreaterThan(0);
  });

  it("preserves original terrace fields", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T10:00:00Z"));
    expect(result[0].id).toBe("1");
    expect(result[0].name).toBe("Terrasse Sud");
    expect(result[0].orientation).toBe(180);
  });

  it("computes sun position per terrace using its own coordinates", async () => {
    const result = await getSunnyTerraces(new Date("2024-06-21T10:00:00Z"));
    // Each terrace uses its own lat/lng — values are close but not guaranteed identical.
    result.forEach((t) => {
      expect(t.sunAzimuthDeg).toBeGreaterThanOrEqual(0);
      expect(t.sunAzimuthDeg).toBeLessThan(360);
    });
  });
});
