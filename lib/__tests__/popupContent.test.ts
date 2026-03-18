import { describe, it, expect } from "vitest";
import { buildPopupHtml } from "../popupContent";
import type { TerraceWithSunInfo } from "@/domain/terrace";

const SUNNY_TERRACE: TerraceWithSunInfo = {
  id: "1",
  name: "Café de Flore",
  address: "172 Bd Saint-Germain, Paris",
  lat: 48.854,
  lng: 2.333,
  orientation: 180,
  openHours: "07:30-01:30",
  isSunny: true,
  sunAzimuthDeg: 185.4,
  sunAltitudeDeg: 62.3,
};

const SHADY_TERRACE: TerraceWithSunInfo = {
  ...SUNNY_TERRACE,
  id: "2",
  name: "Les Deux Magots",
  isSunny: false,
  sunAltitudeDeg: 10.0,
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
      expect(buildPopupHtml(SUNNY_TERRACE)).toContain("Ensoleillée");
    });

    it("shows sun altitude and azimuth", () => {
      const html = buildPopupHtml(SUNNY_TERRACE);
      expect(html).toContain("62.3°");
      expect(html).toContain("185°");
    });
  });

  describe("shady terrace", () => {
    it("shows shady label", () => {
      expect(buildPopupHtml(SHADY_TERRACE)).toContain("À l'ombre");
    });

    it("does not show sunny label", () => {
      expect(buildPopupHtml(SHADY_TERRACE)).not.toContain("Ensoleillée");
    });
  });

  describe("terrace without open hours", () => {
    it("omits the hours line", () => {
      expect(buildPopupHtml(TERRACE_WITHOUT_HOURS)).not.toContain("🕐");
    });
  });

  describe("XSS protection", () => {
    it("escapes < and > in name", () => {
      const malicious: TerraceWithSunInfo = {
        ...SUNNY_TERRACE,
        name: "<script>alert('xss')</script>",
      };
      const html = buildPopupHtml(malicious);
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });

    it("escapes & in address", () => {
      const terrace: TerraceWithSunInfo = {
        ...SUNNY_TERRACE,
        address: "Rue du Bac & Rue de l'Université",
      };
      expect(buildPopupHtml(terrace)).toContain("&amp;");
    });

    it("escapes quotes in open hours", () => {
      const terrace: TerraceWithSunInfo = {
        ...SUNNY_TERRACE,
        openHours: `"07:30"`,
      };
      expect(buildPopupHtml(terrace)).toContain("&quot;");
    });
  });
});
