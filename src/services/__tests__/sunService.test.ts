import { describe, it, expect } from "vitest";
import { computeSunInfo, computeSunScore, buildSunMessage } from "../sunService";

// ── computeSunScore ───────────────────────────────────────────────────────────

describe("computeSunScore", () => {
  it("returns 0 for shady status regardless of position", () => {
    expect(computeSunScore(180, 180, 45, "shady")).toBe(0);
    expect(computeSunScore(180, 180, 70, "shady")).toBe(0);
  });

  it("returns 100 for perfect alignment and high altitude (≥ 60°)", () => {
    // diff = 0°, alt = 65° → angularFactor=1, altitudeFactor=1 → 100
    expect(computeSunScore(180, 180, 65, "sunny")).toBe(100);
  });

  it("returns 0 when sun is at the altitude threshold (5°)", () => {
    // altitudeFactor = (5 - 5) / 55 = 0
    expect(computeSunScore(180, 180, 5, "sunny")).toBe(0);
  });

  it("gives higher score for better angular alignment", () => {
    const aligned  = computeSunScore(180, 180, 45, "sunny"); // 0° diff
    const offset40 = computeSunScore(180, 220, 45, "sunny"); // 40° diff
    const offset59 = computeSunScore(180, 239, 45, "sunny"); // 59° diff
    expect(aligned).toBeGreaterThan(offset40);
    expect(offset40).toBeGreaterThan(offset59);
  });

  it("gives higher score for higher altitude", () => {
    const high = computeSunScore(180, 180, 60, "sunny");
    const low  = computeSunScore(180, 180, 15, "sunny");
    expect(high).toBeGreaterThan(low);
  });

  it("partial status can produce a non-zero score", () => {
    // 65° diff, good altitude
    const score = computeSunScore(180, 245, 45, "partial");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(computeSunScore(180, 180, 45, "sunny"));
  });

  it("score is always in [0, 100]", () => {
    const cases = [
      computeSunScore(0,   0,    0,  "shady"),
      computeSunScore(180, 180,  5,  "sunny"),
      computeSunScore(180, 180,  65, "sunny"),
      computeSunScore(90,  200,  30, "partial"),
      computeSunScore(270, 10,   80, "sunny"),
    ];
    cases.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    });
  });

  it("handles 360°/0° wrap-around correctly", () => {
    // sun at 350°, terrace at 10° → diff = 20°
    const a = computeSunScore(10,  350, 45, "sunny");
    // sun at 10°, terrace at 350° → diff = 20°
    const b = computeSunScore(350, 10,  45, "sunny");
    expect(a).toBe(b);
  });
});

// ── buildSunMessage ───────────────────────────────────────────────────────────

describe("buildSunMessage", () => {
  it("returns 'À l'ombre' for shady status", () => {
    expect(buildSunMessage("shady", null, null)).toBe("À l'ombre");
  });

  it("returns '☀️ Plein soleil (4h+)' when remaining ≥ 240 min", () => {
    const sunUntil = new Date("2024-06-21T14:00:00Z");
    expect(buildSunMessage("sunny", sunUntil, 240)).toBe("☀️ Plein soleil (4h+)");
  });

  it("returns '🌤 Partiellement ensoleillé (4h+)' for partial at max scan", () => {
    const sunUntil = new Date("2024-06-21T14:00:00Z");
    expect(buildSunMessage("partial", sunUntil, 240)).toBe(
      "🌤 Partiellement ensoleillé (4h+)"
    );
  });

  it("includes the sunUntil time in 'HHhMM' format", () => {
    const sunUntil = new Date(2024, 5, 21, 18, 30); // 18h30 local
    const msg = buildSunMessage("sunny", sunUntil, 90);
    expect(msg).toContain("18h30");
    expect(msg).toContain("Plein soleil");
    expect(msg).toContain("jusqu'à");
  });

  it("formats midnight as '00h00'", () => {
    const sunUntil = new Date(2024, 5, 21, 0, 0);
    expect(buildSunMessage("sunny", sunUntil, 5)).toContain("00h00");
  });

  it("uses ☀️ icon for sunny status", () => {
    const sunUntil = new Date(2024, 5, 21, 18, 0);
    expect(buildSunMessage("sunny", sunUntil, 60)).toMatch(/^☀️/);
  });

  it("uses 🌤 icon for partial status", () => {
    const sunUntil = new Date(2024, 5, 21, 17, 0);
    expect(buildSunMessage("partial", sunUntil, 30)).toMatch(/^🌤/);
  });

  it("returns label without time when sunUntil is null (edge case)", () => {
    const msg = buildSunMessage("sunny", null, null);
    expect(msg).toBe("☀️ Plein soleil");
    expect(msg).not.toContain("jusqu'à");
  });
});

// ── computeSunInfo (integration of all helpers) ───────────────────────────────

describe("computeSunInfo", () => {
  const PARIS = { lat: 48.8566, lng: 2.3522 };
  const NOON_SUMMER  = new Date("2024-06-21T10:00:00Z"); // ~12h Paris
  const MIDNIGHT     = new Date("2024-06-21T00:00:00Z");

  describe("shady case (midnight)", () => {
    it("returns status=shady", () => {
      expect(computeSunInfo(180, PARIS.lat, PARIS.lng, MIDNIGHT).status).toBe("shady");
    });

    it("returns score=0", () => {
      expect(computeSunInfo(180, PARIS.lat, PARIS.lng, MIDNIGHT).score).toBe(0);
    });

    it("returns sunUntil=null", () => {
      expect(computeSunInfo(180, PARIS.lat, PARIS.lng, MIDNIGHT).sunUntil).toBeNull();
    });

    it("returns message 'À l'ombre'", () => {
      expect(computeSunInfo(180, PARIS.lat, PARIS.lng, MIDNIGHT).message).toBe(
        "À l'ombre"
      );
    });
  });

  describe("sunny case (south-facing, noon summer)", () => {
    it("returns status=sunny for south-facing terrace", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, NOON_SUMMER);
      expect(info.status).toBe("sunny");
    });

    it("returns score > 0", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, NOON_SUMMER);
      expect(info.score).toBeGreaterThan(0);
    });

    it("sets sunUntil to a future date", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, NOON_SUMMER);
      expect(info.sunUntil).not.toBeNull();
      expect(info.sunUntil!.getTime()).toBeGreaterThan(NOON_SUMMER.getTime());
    });

    it("includes a non-empty message", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, NOON_SUMMER);
      expect(info.message.length).toBeGreaterThan(0);
    });
  });

  describe("output shape", () => {
    it("azimuthDeg is in [0, 360)", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, NOON_SUMMER);
      expect(info.azimuthDeg).toBeGreaterThanOrEqual(0);
      expect(info.azimuthDeg).toBeLessThan(360);
    });

    it("altitudeDeg is positive at noon", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, NOON_SUMMER);
      expect(info.altitudeDeg).toBeGreaterThan(0);
    });

    it("altitudeDeg is negative at midnight", () => {
      const info = computeSunInfo(180, PARIS.lat, PARIS.lng, MIDNIGHT);
      expect(info.altitudeDeg).toBeLessThan(0);
    });
  });
});
