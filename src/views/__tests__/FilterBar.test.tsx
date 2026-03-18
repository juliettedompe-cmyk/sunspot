import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterBar from "../components/FilterBar";
import { DEFAULT_FILTERS, type Filters } from "@/types/filters";

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderBar(props: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  const onChange = props.onChange ?? vi.fn();
  render(
    <FilterBar
      filters={DEFAULT_FILTERS}
      onChange={onChange}
      hasUserPosition={false}
      {...props}
    />
  );
  return { onChange };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FilterBar", () => {
  describe("sun exposure chips", () => {
    it("renders the three exposure options", () => {
      renderBar();
      expect(screen.getByText("Toutes")).toBeTruthy();
      expect(screen.getByText("Ensoleillées")).toBeTruthy();
      expect(screen.getByText("Plein soleil")).toBeTruthy();
    });

    it("marks the active filter with aria-pressed=true", () => {
      renderBar({ filters: { ...DEFAULT_FILTERS, sunExposure: "any-sun" } });
      expect(
        screen.getByRole("button", { name: "Ensoleillées" }).getAttribute("aria-pressed")
      ).toBe("true");
    });

    it("marks inactive filters with aria-pressed=false", () => {
      renderBar({ filters: { ...DEFAULT_FILTERS, sunExposure: "any-sun" } });
      expect(
        screen.getByRole("button", { name: "Toutes" }).getAttribute("aria-pressed")
      ).toBe("false");
    });

    it("calls onChange with sunExposure='any-sun' when Ensoleillées is clicked", () => {
      const onChange = vi.fn();
      renderBar({ onChange });
      fireEvent.click(screen.getByText("Ensoleillées"));
      expect(onChange).toHaveBeenCalledOnce();
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.sunExposure).toBe("any-sun");
    });

    it("calls onChange with sunExposure='sunny-only' when Plein soleil is clicked", () => {
      const onChange = vi.fn();
      renderBar({ onChange });
      fireEvent.click(screen.getByText("Plein soleil"));
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.sunExposure).toBe("sunny-only");
    });

    it("calls onChange with sunExposure='all' when Toutes is clicked", () => {
      const onChange = vi.fn();
      renderBar({
        onChange,
        filters: { ...DEFAULT_FILTERS, sunExposure: "sunny-only" },
      });
      fireEvent.click(screen.getByText("Toutes"));
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.sunExposure).toBe("all");
    });

    it("preserves other filter values when changing sun exposure", () => {
      const onChange = vi.fn();
      const initial: Filters = {
        sunExposure: "all",
        minSunRemainingMinutes: 60,
        nearbyOnly: true,
      };
      renderBar({ onChange, filters: initial, hasUserPosition: true });
      fireEvent.click(screen.getByText("Ensoleillées"));
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.minSunRemainingMinutes).toBe(60);
    });
  });

  describe("nearby filter", () => {
    it("hides 'À 1 km' button when user position is unavailable", () => {
      renderBar({ hasUserPosition: false });
      expect(screen.queryByText("À 1 km")).toBeNull();
    });

    it("shows 'À 1 km' button when user position is available", () => {
      renderBar({ hasUserPosition: true });
      expect(screen.getByText("À 1 km")).toBeTruthy();
    });

    it("toggles nearbyOnly when 'À 1 km' is clicked", () => {
      const onChange = vi.fn();
      renderBar({ onChange, hasUserPosition: true });
      fireEvent.click(screen.getByText("À 1 km"));
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.nearbyOnly).toBe(true);
    });

    it("marks 'À 1 km' as pressed when nearbyOnly is active", () => {
      renderBar({
        hasUserPosition: true,
        filters: { ...DEFAULT_FILTERS, nearbyOnly: true },
      });
      expect(
        screen.getByRole("button", { name: "À 1 km" }).getAttribute("aria-pressed")
      ).toBe("true");
    });
  });

  describe("min sun remaining select", () => {
    it("renders the min sun select", () => {
      renderBar();
      expect(screen.getByRole("combobox", { name: /soleil restant/i })).toBeTruthy();
    });

    it("calls onChange with minSunRemainingMinutes=60 when '1 h' is selected", () => {
      const onChange = vi.fn();
      renderBar({ onChange });
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "60" } });
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.minSunRemainingMinutes).toBe(60);
    });

    it("calls onChange with minSunRemainingMinutes=null when '—' is selected", () => {
      const onChange = vi.fn();
      renderBar({
        onChange,
        filters: { ...DEFAULT_FILTERS, minSunRemainingMinutes: 60 },
      });
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
      const emitted: Filters = onChange.mock.calls[0][0];
      expect(emitted.minSunRemainingMinutes).toBeNull();
    });
  });
});
