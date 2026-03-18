import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client before importing the repository
vi.mock("../supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { getAllTerraces } from "../terraceRepository";
import { supabase } from "../supabaseClient";
import type { TerraceRow } from "../types";

const mockFrom = vi.mocked(supabase.from);

function mockSupabaseQuery(data: TerraceRow[] | null, error: { message: string } | null) {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      returns: vi.fn().mockResolvedValue({ data, error }),
    }),
  } as unknown as ReturnType<typeof supabase.from>);
}

const FIXTURE_ROWS: TerraceRow[] = [
  {
    id: "abc-123",
    name: "Café de Flore",
    address: "172 Bd Saint-Germain, Paris",
    lat: 48.854,
    lng: 2.333,
    orientation: 180,
    open_hours: "07:30-01:30",
  },
  {
    id: "def-456",
    name: "Le Consulat",
    address: "18 Rue Norvins, Paris",
    lat: 48.886,
    lng: 2.337,
    orientation: 90,
    open_hours: null,
  },
];

describe("getAllTerraces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mapped terraces on success", async () => {
    mockSupabaseQuery(FIXTURE_ROWS, null);

    const result = await getAllTerraces();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "abc-123",
      name: "Café de Flore",
      address: "172 Bd Saint-Germain, Paris",
      lat: 48.854,
      lng: 2.333,
      orientation: 180,
      openHours: "07:30-01:30",
    });
  });

  it("maps open_hours null to undefined", async () => {
    mockSupabaseQuery(FIXTURE_ROWS, null);

    const result = await getAllTerraces();

    expect(result[1].openHours).toBeUndefined();
  });

  it("returns empty array when data is null", async () => {
    mockSupabaseQuery(null, null);

    const result = await getAllTerraces();

    expect(result).toEqual([]);
  });

  it("throws when Supabase returns an error", async () => {
    mockSupabaseQuery(null, { message: "relation does not exist" });

    await expect(getAllTerraces()).rejects.toThrow("Failed to fetch terraces: relation does not exist");
  });

  it("queries the terraces_with_coords view with the expected columns", async () => {
    mockSupabaseQuery([], null);

    await getAllTerraces();

    expect(mockFrom).toHaveBeenCalledWith("terraces_with_coords");
  });
});
