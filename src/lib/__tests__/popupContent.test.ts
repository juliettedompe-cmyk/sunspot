import { describe, it, expect } from "vitest";
import { buildPopupHtml } from "../popupContent";
import type { TerraceWithSunInfo } from "@/types/terrace";

const SUNNY_TERRACE: TerraceWithSunInfo = {
  id: "1",
  name: "Café de Flore",
  address: "172 Bd Saint-Germain, Paris",
  lat: 48.854,
  lng: 2.333,
  orientation: 180,
  openHours: "07:30-01:30",
  sunStatus: "sunny",
  sunScore: 82,
  sunAzimuthDeg: 185.4,
  sunAltitudeDeg: 62.3,
  sunRemainingMinutes: 90,
  sunUntil: new Date("2024-06-21T16:30:00Z"),
  sunMessage: "☀️ Plein soleil jusqu'à 18h30",
};

const SHADY_TERRACE: TerraceWithSunInfo = {
  ...SUNNY_TERRACE,
  id: "2",
  name: "Les Deux Magots",
  sunStatus: "shady",
  sunScore: 0,
  sunAltitudeDeg: 10.0,
  sunRemainingMinutes: null,
  sunUntil: null,
  sunMessage: "À l'ombre",
};

const TERRACE_WITHOUT_HOURS: TerraceWithSunInfo = {
  ...SUNNY_TERRACE,
  id: "3",
  openHours: undefined,
};

describe("buildPopupHtml", () => {
  describe("sunny terrace", () => {
    it("contains the terrace name", () => {
      expect(buildPopupHtml(SUNNY_TERRACE)).toContain("Café de Flore");
    });

    it("contains the address", () => {
      expect(buildPopupHtml(SUNNY_TERRACE)).toContain("172 Bd Saint-Germain, Paris");
    });

    it("shows open hours when provided", () => {
      expect(buildPopupHtml(SUNNY_TERRACE)).toContain("07:30-01:30");
    });

    it("shows sunny label", () => {
      expect(buildPopupHtml(SUNNY_TERRACE)).toContain("Plein soleil");
    });

    it("shows remaining sun time", () => {
      const html = buildPopupHtml(SUNNY_TERRACE);
      expect(html).toContain("90");
    });
  });

  describe("shady terrace", () => {
    it("shows shady label", () => {
      expect(buildPopupHtml(SHADY_TERRACE)).toContain("À l'ombre");
    });

    it("does not show sunny label", () => {
      expect(buildPopupHtml(SHADY_TERRACE)).not.toContain("Plein soleil");
    });
  });

  describe("terrace without open hours", () => {
    it("omits the hours line", () => {
      expect(buildPopupHtml(TERRACE_WITHOUT_HOURS)).not.toContain("🕐");
    });
  });

  describe("XSS protection", () => {
    it("escapes < and > in name", () => {
      const html = buildPopupHtml({ ...SUNNY_TERRACE, name: "<script>alert('xss')</script>" });
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });

    it("escapes & in address", () => {
      const html = buildPopupHtml({ ...SUNNY_TERRACE, address: "Rue du Bac & Rue de l'Université" });
      expect(html).toContain("&amp;");
    });

    it("escapes quotes in open hours", () => {
      const html = buildPopupHtml({ ...SUNNY_TERRACE, openHours: `"07:30"` });
      expect(html).toContain("&quot;");
    });
  });
});
