import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { getAllTerraces } from "../terraceRepository";
import { supabase } from "../supabaseClient";
import type { TerraceRow } from "../terraceRow";

const mockFrom = vi.mocked(supabase.from);

function mockSupabaseQuery(data: TerraceRow[] | null, error: { message: string } | null) {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        returns: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  } as unknown as ReturnType<typeof supabase.from>);
}

const FIXTURE_ROWS: TerraceRow[] = [
  {
    id: "abc-123",
    name: "Café de Flore",
    address: "172 Bd Saint-Germain, Paris",
    latitude: 48.854,
    longitude: 2.333,
    orientation: 180,
    open_hours: "07:30-01:30",
    venue_type: "café",
    source: "manual",
    source_id: null,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "def-456",
    name: "Le Consulat",
    address: "18 Rue Norvins, Paris",
    latitude: 48.886,
    longitude: 2.337,
    orientation: 90,
    open_hours: null,
    venue_type: "bar",
    source: "manual",
    source_id: null,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
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

    await expect(getAllTerraces()).rejects.toThrow(
      "Failed to fetch terraces: relation does not exist"
    );
  });

  it("queries the terraces table", async () => {
    mockSupabaseQuery([], null);

    await getAllTerraces();

    expect(mockFrom).toHaveBeenCalledWith("terraces");
  });

  it("filters to active terraces only", async () => {
    const mockEq = vi.fn().mockReturnValue({
      returns: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>);

    await getAllTerraces();

    expect(mockEq).toHaveBeenCalledWith("is_active", true);
  });
});
