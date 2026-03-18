import { describe, it, expect } from "vitest";
import { toTerrace } from "../terraceMapping";
import type { TerraceRow } from "../terraceRow";

const BASE_ROW: TerraceRow = {
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
};

describe("toTerrace", () => {
  it("maps latitude to lat and longitude to lng", () => {
    const result = toTerrace(BASE_ROW);
    expect(result.lat).toBe(48.854);
    expect(result.lng).toBe(2.333);
  });

  it("preserves id, name, address, and orientation unchanged", () => {
    const result = toTerrace(BASE_ROW);
    expect(result).toMatchObject({
      id: "abc-123",
      name: "Café de Flore",
      address: "172 Bd Saint-Germain, Paris",
      orientation: 180,
    });
  });

  it("maps open_hours to openHours when present", () => {
    expect(toTerrace(BASE_ROW).openHours).toBe("07:30-01:30");
  });

  it("maps null open_hours to undefined", () => {
    expect(toTerrace({ ...BASE_ROW, open_hours: null }).openHours).toBeUndefined();
  });

  it("does not expose DB-only fields on the domain object", () => {
    const result = toTerrace(BASE_ROW) as Record<string, unknown>;
    expect(result.venue_type).toBeUndefined();
    expect(result.source).toBeUndefined();
    expect(result.source_id).toBeUndefined();
    expect(result.is_active).toBeUndefined();
    expect(result.created_at).toBeUndefined();
    expect(result.updated_at).toBeUndefined();
  });

  it("does not expose the raw latitude/longitude keys on the domain object", () => {
    const result = toTerrace(BASE_ROW) as Record<string, unknown>;
    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
  });
});
