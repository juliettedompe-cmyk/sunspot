import { describe, it, expect } from "vitest";
import { getSunPosition, isTerraceSunny } from "../sunExposure";

describe("isTerraceSunny", () => {
  // Helper to create a SunPosition directly
  function sun(altitudeDeg: number, azimuthDeg: number) {
    return { altitudeDeg, azimuthDeg };
  }

  describe("altitude threshold", () => {
    it("returns false when sun is below 5°", () => {
      expect(isTerraceSunny(180, sun(3, 180))).toBe(false);
    });

    it("returns false when sun is exactly at 5°", () => {
      expect(isTerraceSunny(180, sun(5, 180))).toBe(false);
    });

    it("returns false when sun is below horizon (night)", () => {
      expect(isTerraceSunny(180, sun(-10, 180))).toBe(false);
    });

    it("returns true when sun is just above 5°", () => {
      expect(isTerraceSunny(180, sun(5.1, 180))).toBe(true);
    });
  });

  describe("angular difference", () => {
    it("returns true when sun is perfectly aligned with terrace orientation", () => {
      expect(isTerraceSunny(180, sun(40, 180))).toBe(true);
    });

    it("returns true when sun is 89° from terrace orientation", () => {
      expect(isTerraceSunny(180, sun(40, 269))).toBe(true);
    });

    it("returns false when sun is exactly 90° from terrace orientation", () => {
      expect(isTerraceSunny(180, sun(40, 270))).toBe(false);
    });

    it("returns false when sun is 91° from terrace orientation", () => {
      expect(isTerraceSunny(180, sun(40, 271))).toBe(false);
    });

    it("returns false when sun is opposite the terrace (180°)", () => {
      expect(isTerraceSunny(0, sun(40, 180))).toBe(false);
    });
  });

  describe("wrap-around (360°/0° boundary)", () => {
    it("handles sun at 350°, terrace at 10° (diff = 20°)", () => {
      expect(isTerraceSunny(10, sun(40, 350))).toBe(true);
    });

    it("handles sun at 10°, terrace at 350° (diff = 20°)", () => {
      expect(isTerraceSunny(350, sun(40, 10))).toBe(true);
    });

    it("handles sun at 0°, terrace at 359° (diff = 1°)", () => {
      expect(isTerraceSunny(359, sun(40, 0))).toBe(true);
    });

    it("handles sun at 91°, terrace at 0° (diff = 91°) — false", () => {
      expect(isTerraceSunny(0, sun(40, 91))).toBe(false);
    });
  });
});

describe("getSunPosition", () => {
  const PARIS = { lat: 48.8566, lng: 2.3522 };

  it("returns negative altitude at midnight UTC in Paris", () => {
    const midnight = new Date("2024-06-21T00:00:00Z");
    const pos = getSunPosition(PARIS.lat, PARIS.lng, midnight);
    expect(pos.altitudeDeg).toBeLessThan(0);
  });

  it("returns high altitude near solar noon in Paris in summer", () => {
    // Summer solstice, ~12:00 UTC+2 → 10:00 UTC
    const noon = new Date("2024-06-21T10:00:00Z");
    const pos = getSunPosition(PARIS.lat, PARIS.lng, noon);
    expect(pos.altitudeDeg).toBeGreaterThan(60);
    // Sun should be roughly south at noon in Paris
    expect(pos.azimuthDeg).toBeGreaterThan(150);
    expect(pos.azimuthDeg).toBeLessThan(210);
  });

  it("returns azimuth in [0, 360) range", () => {
    const date = new Date("2024-03-20T09:00:00Z");
    const pos = getSunPosition(PARIS.lat, PARIS.lng, date);
    expect(pos.azimuthDeg).toBeGreaterThanOrEqual(0);
    expect(pos.azimuthDeg).toBeLessThan(360);
  });

  it("returns eastward azimuth in the morning", () => {
    // Morning in Paris (around 8am local = 6am UTC)
    const morning = new Date("2024-06-21T06:00:00Z");
    const pos = getSunPosition(PARIS.lat, PARIS.lng, morning);
    // Sun should be in the northeast/east quadrant
    expect(pos.azimuthDeg).toBeGreaterThan(0);
    expect(pos.azimuthDeg).toBeLessThan(180);
  });

  it("returns westward azimuth in the afternoon", () => {
    // Afternoon in Paris (around 5pm local = 3pm UTC)
    const afternoon = new Date("2024-06-21T15:00:00Z");
    const pos = getSunPosition(PARIS.lat, PARIS.lng, afternoon);
    // Sun should be in the west/southwest quadrant
    expect(pos.azimuthDeg).toBeGreaterThan(180);
    expect(pos.azimuthDeg).toBeLessThan(360);
  });
});
