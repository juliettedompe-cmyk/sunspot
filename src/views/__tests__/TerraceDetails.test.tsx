import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TerraceDetails from "../components/TerraceDetails";
import type { TerraceWithSunInfo } from "@/types/terrace";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const SUNNY_TERRACE: TerraceWithSunInfo = {
  id: "1",
  name: "Café de Flore",
  address: "172 Bd Saint-Germain, 75006 Paris",
  lat: 48.854,
  lng: 2.333,
  orientation: 180,
  openHours: "07:30-01:30",
  sunStatus: "sunny",
  sunScore: 82,
  sunAzimuthDeg: 185,
  sunAltitudeDeg: 62,
  sunRemainingMinutes: 90,
  sunUntil: new Date("2024-06-21T16:30:00Z"),
  sunMessage: "☀️ Plein soleil jusqu'à 18h30",
  distanceKm: 0.35,
};

const SHADY_TERRACE: TerraceWithSunInfo = {
  ...SUNNY_TERRACE,
  id: "2",
  name: "Brasserie Lipp",
  sunStatus: "shady",
  sunRemainingMinutes: null,
};

const PARTIAL_TERRACE: TerraceWithSunInfo = {
  ...SUNNY_TERRACE,
  id: "3",
  name: "Les Deux Magots",
  sunStatus: "partial",
  sunRemainingMinutes: 45,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TerraceDetails", () => {
  describe("content rendering", () => {
    it("renders the terrace name", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("Café de Flore")).toBeTruthy();
    });

    it("renders the terrace address", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("172 Bd Saint-Germain, 75006 Paris")).toBeTruthy();
    });

    it("shows formatted distance when available", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("350 m")).toBeTruthy();
    });

    it("does not show distance when unavailable", () => {
      const t = { ...SUNNY_TERRACE, distanceKm: undefined };
      render(<TerraceDetails terrace={t} onClose={vi.fn()} />);
      expect(screen.queryByText(/\d+ m|\d+\.\d+ km/)).toBeNull();
    });

    it("shows open hours when present", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("07:30-01:30")).toBeTruthy();
    });

    it("omits open hours when absent", () => {
      const t = { ...SUNNY_TERRACE, openHours: undefined };
      render(<TerraceDetails terrace={t} onClose={vi.fn()} />);
      expect(screen.queryByText(/🕐/)).toBeNull();
    });
  });

  describe("sun status", () => {
    it("shows 'Plein soleil' for sunny terrace", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("Plein soleil")).toBeTruthy();
    });

    it("shows 'Partiellement ensoleillé' for partial terrace", () => {
      render(<TerraceDetails terrace={PARTIAL_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("Partiellement ensoleillé")).toBeTruthy();
    });

    it("shows 'À l'ombre' for shady terrace", () => {
      render(<TerraceDetails terrace={SHADY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("À l'ombre")).toBeTruthy();
    });
  });

  describe("remaining sun time", () => {
    it("shows remaining minutes for sunny terrace (90 min → 1h30)", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("1h30")).toBeTruthy();
    });

    it("shows remaining minutes for partial terrace (45 min)", () => {
      render(<TerraceDetails terrace={PARTIAL_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByText("45 min")).toBeTruthy();
    });

    it("does not show remaining time for shady terrace", () => {
      render(<TerraceDetails terrace={SHADY_TERRACE} onClose={vi.fn()} />);
      expect(screen.queryByText(/encore environ/i)).toBeNull();
    });
  });

  describe("close button", () => {
    it("renders a close button", () => {
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={vi.fn()} />);
      expect(screen.getByRole("button", { name: /Fermer/i })).toBeTruthy();
    });

    it("calls onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(<TerraceDetails terrace={SUNNY_TERRACE} onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: /Fermer/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
