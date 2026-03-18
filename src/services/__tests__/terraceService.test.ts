import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Terrace } from "@/types/terrace";

vi.mock("@/models/terraceRepository", () => ({
  getAllTerraces: vi.fn(),
}));

import { getEnrichedTerraces } from "../terraceService";
import { getAllTerraces } from "@/models/terraceRepository";

const mockGetAllTerraces = vi.mocked(getAllTerraces);

const PARIS_TERRACES: Terrace[] = [
  { id: "1", name: "Terrasse Sud",  address: "1 Rue Test", lat: 48.856, lng: 2.352, orientation: 180 },
  { id: "2", name: "Terrasse Nord", address: "2 Rue Test", lat: 48.857, lng: 2.353, orientation: 0   },
  { id: "3", name: "Terrasse Est",  address: "3 Rue Test", lat: 48.858, lng: 2.354, orientation: 90  },
];

const NOON_SUMMER  = new Date("2024-06-21T10:00:00Z"); // ~12h Paris
const MIDNIGHT     = new Date("2024-06-21T00:00:00Z");

describe("getEnrichedTerraces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllTerraces.mockResolvedValue(PARIS_TERRACES);
  });

  describe("data fetching", () => {
    it("calls getAllTerraces once", async () => {
      await getEnrichedTerraces(NOON_SUMMER);
      expect(mockGetAllTerraces).toHaveBeenCalledOnce();
    });

    it("returns one enriched terrace per repo terrace", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      expect(result).toHaveLength(3);
    });

    it("throws when the repository throws", async () => {
      mockGetAllTerraces.mockRejectedValue(new Error("DB down"));
      await expect(getEnrichedTerraces(NOON_SUMMER)).rejects.toThrow("DB down");
    });
  });

  describe("sun field presence", () => {
    it("adds all required sun fields to each terrace", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
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

    it("sunScore is always in [0, 100]", async () => {
      const noon = await getEnrichedTerraces(NOON_SUMMER);
      const night = await getEnrichedTerraces(MIDNIGHT);
      [...noon, ...night].forEach((t) => {
        expect(t.sunScore).toBeGreaterThanOrEqual(0);
        expect(t.sunScore).toBeLessThanOrEqual(100);
      });
    });

    it("sunMessage is a non-empty string", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      result.forEach((t) => expect(t.sunMessage.length).toBeGreaterThan(0));
    });
  });

  describe("sun status at noon summer", () => {
    it("marks south-facing terrace as sunny", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      expect(result.find((t) => t.id === "1")!.sunStatus).toBe("sunny");
    });

    it("marks north-facing terrace as shady", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      expect(result.find((t) => t.id === "2")!.sunStatus).toBe("shady");
    });
  });

  describe("sun status at midnight", () => {
    it("marks all terraces as shady", async () => {
      const result = await getEnrichedTerraces(MIDNIGHT);
      result.forEach((t) => expect(t.sunStatus).toBe("shady"));
    });

    it("sets sunRemainingMinutes to null for all terraces", async () => {
      const result = await getEnrichedTerraces(MIDNIGHT);
      result.forEach((t) => expect(t.sunRemainingMinutes).toBeNull());
    });

    it("sets sunUntil to null for all terraces", async () => {
      const result = await getEnrichedTerraces(MIDNIGHT);
      result.forEach((t) => expect(t.sunUntil).toBeNull());
    });
  });

  describe("sunUntil / sunRemainingMinutes consistency", () => {
    it("sunny terrace has sunUntil after the query date", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      const south = result.find((t) => t.id === "1")!;
      expect(south.sunUntil).not.toBeNull();
      expect(south.sunUntil!.getTime()).toBeGreaterThan(NOON_SUMMER.getTime());
    });

    it("sunRemainingMinutes matches sunUntil within 1 minute", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      result.forEach((t) => {
        if (t.sunUntil === null) {
          expect(t.sunRemainingMinutes).toBeNull();
        } else {
          const expected = Math.round(
            (t.sunUntil.getTime() - NOON_SUMMER.getTime()) / 60_000
          );
          expect(t.sunRemainingMinutes).toBe(expected);
        }
      });
    });
  });

  describe("original field preservation", () => {
    it("preserves id, name, address, orientation from the repository", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      const south = result.find((t) => t.id === "1")!;
      expect(south.id).toBe("1");
      expect(south.name).toBe("Terrasse Sud");
      expect(south.address).toBe("1 Rue Test");
      expect(south.orientation).toBe(180);
    });

    it("preserves lat and lng", async () => {
      const result = await getEnrichedTerraces(NOON_SUMMER);
      const t = result.find((t) => t.id === "1")!;
      expect(t.lat).toBe(48.856);
      expect(t.lng).toBe(2.352);
    });
  });
});
