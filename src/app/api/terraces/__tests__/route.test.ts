import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { TerraceWithSunInfo } from "@/types/terrace";

vi.mock("@/services/terraceService", () => ({
  getEnrichedTerraces: vi.fn(),
}));

import { listTerraces } from "@/controllers/terraceController";
import { getEnrichedTerraces } from "@/services/terraceService";

const mockGetSunnyTerraces = vi.mocked(getEnrichedTerraces);

const FIXTURE_TERRACES: TerraceWithSunInfo[] = [
  {
    id: "1",
    name: "Café de Flore",
    address: "172 Bd Saint-Germain, Paris",
    lat: 48.854,
    lng: 2.333,
    orientation: 180,
    sunStatus: "sunny",
    sunScore: 82,
    sunAzimuthDeg: 185,
    sunAltitudeDeg: 62,
    sunRemainingMinutes: 90,
    sunUntil: new Date("2024-06-21T16:30:00Z"),
    sunMessage: "☀️ Plein soleil jusqu'à 18h30",
  },
];

function buildRequest(datetime?: string): NextRequest {
  const url = datetime
    ? `http://localhost/api/terraces?datetime=${encodeURIComponent(datetime)}`
    : "http://localhost/api/terraces";
  return new NextRequest(url);
}

describe("terraceController.listTerraces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSunnyTerraces.mockResolvedValue(FIXTURE_TERRACES);
  });

  it("returns 200 with terraces for a valid ISO datetime", async () => {
    const res = await listTerraces(buildRequest("2024-06-21T10:00:00Z"));

    expect(res.status).toBe(200);
    // Dates are serialised to ISO strings by JSON.stringify — compare the parsed body
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("1");
    expect(body[0].sunStatus).toBe("sunny");
    expect(body[0].sunScore).toBe(82);
    expect(body[0].sunUntil).toBe("2024-06-21T16:30:00.000Z");
  });

  it("uses current time when no datetime param is provided", async () => {
    const before = new Date();
    await listTerraces(buildRequest());
    const after = new Date();

    const [calledDate] = mockGetSunnyTerraces.mock.calls[0];
    expect(calledDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(calledDate.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("returns 400 for an invalid datetime string", async () => {
    const res = await listTerraces(buildRequest("not-a-date"));

    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("passes the parsed date to getEnrichedTerraces", async () => {
    const iso = "2024-06-21T10:00:00.000Z";
    await listTerraces(buildRequest(iso));

    expect(mockGetSunnyTerraces).toHaveBeenCalledWith(new Date(iso));
  });

  it("returns 500 when getEnrichedTerraces throws", async () => {
    mockGetSunnyTerraces.mockRejectedValue(new Error("DB connection lost"));

    const res = await listTerraces(buildRequest("2024-06-21T10:00:00Z"));

    expect(res.status).toBe(500);
    expect(await res.json()).toHaveProperty("error");
  });
});
