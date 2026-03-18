import { describe, it, expect } from "vitest";
import { getSunPosition, getSunStatus, estimateSunRemainingMinutes, isTerraceSunny } from "../sunExposure";

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

describe("getSunStatus", () => {
  function sun(altitudeDeg: number, azimuthDeg: number) {
    return { altitudeDeg, azimuthDeg };
  }

  it("returns shady when sun is below 5°", () => {
    expect(getSunStatus(180, sun(3, 180))).toBe("shady");
  });

  it("returns shady at night", () => {
    expect(getSunStatus(180, sun(-10, 180))).toBe("shady");
  });

  it("returns sunny when well aligned (diff < 60°)", () => {
    expect(getSunStatus(180, sun(40, 180))).toBe("sunny");
    expect(getSunStatus(180, sun(40, 220))).toBe("sunny"); // 40° diff
  });

  it("returns partial when on the edge (60° ≤ diff < 90°)", () => {
    expect(getSunStatus(180, sun(40, 245))).toBe("partial"); // 65° diff
    expect(getSunStatus(180, sun(40, 269))).toBe("partial"); // 89° diff
  });

  it("returns shady when outside the arc (diff ≥ 90°)", () => {
    expect(getSunStatus(180, sun(40, 270))).toBe("shady"); // 90° diff
    expect(getSunStatus(180, sun(40, 300))).toBe("shady"); // 120° diff
  });

  it("handles 360°/0° boundary correctly", () => {
    expect(getSunStatus(10, sun(40, 350))).toBe("sunny"); // 20° diff
    expect(getSunStatus(350, sun(40, 10))).toBe("sunny"); // 20° diff
  });
});

describe("estimateSunRemainingMinutes", () => {
  const PARIS = { lat: 48.8566, lng: 2.3522 };

  it("returns null for a shady terrace at midnight", () => {
    const midnight = new Date("2024-06-21T00:00:00Z");
    expect(estimateSunRemainingMinutes(180, PARIS.lat, PARIS.lng, midnight)).toBeNull();
  });

  it("returns a positive number for a south-facing terrace at noon in summer", () => {
    const noon = new Date("2024-06-21T10:00:00Z");
    const remaining = estimateSunRemainingMinutes(180, PARIS.lat, PARIS.lng, noon);
    expect(remaining).not.toBeNull();
    expect(remaining!).toBeGreaterThan(0);
  });

  it("returns 240 (max) for a terrace with sun for more than 4 hours", () => {
    // Summer solstice early morning — south terrace will have sun for hours
    const earlyMorning = new Date("2024-06-21T08:00:00Z");
    const remaining = estimateSunRemainingMinutes(180, PARIS.lat, PARIS.lng, earlyMorning);
    expect(remaining).toBe(240);
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
    // Max theoretical elevation in Paris: ~64° but SunCalc gives ~56° at 10:00 UTC
    const noon = new Date("2024-06-21T10:00:00Z");
    const pos = getSunPosition(PARIS.lat, PARIS.lng, noon);
    expect(pos.altitudeDeg).toBeGreaterThan(50);
    // At 10:00 UTC, Paris local time = 12:00 CEST but solar noon is ~13:58 CEST.
    // The sun is therefore SE–S (roughly 100–180°), not yet due south.
    expect(pos.azimuthDeg).toBeGreaterThan(100);
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
