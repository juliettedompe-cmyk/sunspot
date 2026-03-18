import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { TerraceWithSunInfo } from "@/domain/terrace";

vi.mock("@/application/getSunnyTerraces", () => ({
  getSunnyTerraces: vi.fn(),
}));

import { GET } from "../route";
import { getSunnyTerraces } from "@/application/getSunnyTerraces";

const mockGetSunnyTerraces = vi.mocked(getSunnyTerraces);

const FIXTURE_TERRACES: TerraceWithSunInfo[] = [
  {
    id: "1",
    name: "Café de Flore",
    address: "172 Bd Saint-Germain, Paris",
    lat: 48.854,
    lng: 2.333,
    orientation: 180,
    isSunny: true,
    sunAzimuthDeg: 185,
    sunAltitudeDeg: 62,
  },
];

function buildRequest(datetime?: string): NextRequest {
  const url = datetime
    ? `http://localhost/api/terraces?datetime=${encodeURIComponent(datetime)}`
    : "http://localhost/api/terraces";
  return new NextRequest(url);
}

describe("GET /api/terraces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSunnyTerraces.mockResolvedValue(FIXTURE_TERRACES);
  });

  it("returns 200 with terraces for a valid ISO datetime", async () => {
    const res = await GET(buildRequest("2024-06-21T10:00:00Z"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(FIXTURE_TERRACES);
  });

  it("uses current time when no datetime param is provided", async () => {
    const before = new Date();
    await GET(buildRequest());
    const after = new Date();

    const [calledDate] = mockGetSunnyTerraces.mock.calls[0];
    expect(calledDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(calledDate.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("returns 400 for an invalid datetime string", async () => {
    const res = await GET(buildRequest("not-a-date"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("passes the parsed date to getSunnyTerraces", async () => {
    const iso = "2024-06-21T10:00:00.000Z";
    await GET(buildRequest(iso));

    expect(mockGetSunnyTerraces).toHaveBeenCalledWith(new Date(iso));
  });

  it("returns 500 when getSunnyTerraces throws", async () => {
    mockGetSunnyTerraces.mockRejectedValue(new Error("DB connection lost"));

    const res = await GET(buildRequest("2024-06-21T10:00:00Z"));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
