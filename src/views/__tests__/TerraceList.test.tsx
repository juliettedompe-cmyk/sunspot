import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TerraceList from "../components/TerraceList";
import type { TerraceWithSunInfo } from "@/types/terrace";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeTerrace(id: string, overrides: Partial<TerraceWithSunInfo> = {}): TerraceWithSunInfo {
  return {
    id,
    name: `Terrasse ${id}`,
    address: `${id} Rue de la Paix, Paris`,
    lat: 48.854,
    lng: 2.333,
    orientation: 180,
    sunStatus: "sunny",
    sunScore: 75,
    sunAzimuthDeg: 185,
    sunAltitudeDeg: 62,
    sunRemainingMinutes: 90,
    sunUntil: new Date("2024-06-21T16:30:00Z"),
    sunMessage: "☀️ Plein soleil (4h+)",
    ...overrides,
  };
}

const FLORE     = makeTerrace("flore",     { name: "Café de Flore",   sunStatus: "sunny",   distanceKm: 0.2 });
const CONSULAT  = makeTerrace("consulat",  { name: "Le Consulat",     sunStatus: "shady",   sunRemainingMinutes: null });
const REPUBLIQUE = makeTerrace("republique", { name: "Place République", sunStatus: "partial", sunRemainingMinutes: 30 });

const ALL = [FLORE, CONSULAT, REPUBLIQUE];

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderList(props: Partial<Parameters<typeof TerraceList>[0]> = {}) {
  return render(
    <TerraceList
      terraces={ALL}
      selectedId={null}
      onSelect={vi.fn()}
      loading={false}
      error={null}
      {...props}
    />
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TerraceList", () => {
  describe("nominal rendering", () => {
    it("renders a list item for each terrace", () => {
      renderList();
      expect(screen.getByText("Café de Flore")).toBeTruthy();
      expect(screen.getByText("Le Consulat")).toBeTruthy();
      expect(screen.getByText("Place République")).toBeTruthy();
    });

    it("renders the terrace address", () => {
      renderList({ terraces: [FLORE] });
      expect(screen.getByText(/Rue de la Paix/)).toBeTruthy();
    });

    it("shows formatted distance when available", () => {
      renderList({ terraces: [FLORE] }); // distanceKm: 0.2
      expect(screen.getByText(/200 m/)).toBeTruthy();
    });

    it("shows remaining sun time when available", () => {
      renderList({ terraces: [FLORE] }); // 90 min = 1h30
      expect(screen.getByText(/1h30/)).toBeTruthy();
    });

    it("does not show remaining time for shady terraces", () => {
      renderList({ terraces: [CONSULAT] }); // sunRemainingMinutes: null
      expect(screen.queryByText(/encore/i)).toBeNull();
    });
  });

  describe("selection", () => {
    it("calls onSelect with the terrace when clicked", () => {
      const onSelect = vi.fn();
      renderList({ onSelect });
      fireEvent.click(screen.getByText("Café de Flore"));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(FLORE);
    });

    it("marks selected terrace with aria-pressed=true", () => {
      renderList({ selectedId: "flore" });
      const buttons = screen.getAllByRole("listitem");
      const floreBtn = buttons.find((el) =>
        el.textContent?.includes("Café de Flore")
      );
      expect(floreBtn).toBeTruthy();
      expect(floreBtn?.getAttribute("aria-pressed")).toBe("true");
    });

    it("does not mark non-selected terraces as pressed", () => {
      renderList({ selectedId: "flore" });
      const buttons = screen.getAllByRole("listitem");
      const consulatBtn = buttons.find((el) =>
        el.textContent?.includes("Le Consulat")
      );
      expect(consulatBtn?.getAttribute("aria-pressed")).toBe("false");
    });
  });

  describe("loading state", () => {
    it("shows a loading skeleton when loading is true", () => {
      render(
        <TerraceList
          terraces={[]}
          selectedId={null}
          onSelect={vi.fn()}
          loading={true}
          error={null}
        />
      );
      expect(screen.getByLabelText("Chargement des terrasses")).toBeTruthy();
      expect(screen.queryByRole("list")).toBeNull();
    });
  });

  describe("empty state", () => {
    it("shows an empty state message when no terraces match", () => {
      renderList({ terraces: [] });
      expect(screen.getByText(/Aucune terrasse trouvée/i)).toBeTruthy();
    });
  });

  describe("error state", () => {
    it("shows an error message when error is set", () => {
      renderList({ terraces: [], error: "Impossible de charger les terrasses." });
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/Impossible de charger/i)).toBeTruthy();
    });
  });
});
