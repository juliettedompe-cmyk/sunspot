import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeSlider from "../components/TimeSlider";

// Fix "now" so tests are deterministic
const FIXED_DATE = new Date("2024-06-21T14:30:00");

describe("TimeSlider", () => {
  describe("rendering", () => {
    it("renders a range slider with aria-label 'Heure'", () => {
      render(<TimeSlider value={FIXED_DATE} onChange={vi.fn()} />);
      const slider = screen.getByRole("slider", { name: /Heure/i });
      expect(slider).toBeTruthy();
    });

    it("shows the current time as a formatted label", () => {
      render(<TimeSlider value={FIXED_DATE} onChange={vi.fn()} />);
      // 14h30 in fr-FR format
      expect(screen.getByText(/14.30/)).toBeTruthy();
    });

    it("renders the 'Maintenant' button", () => {
      render(<TimeSlider value={FIXED_DATE} onChange={vi.fn()} />);
      expect(screen.getByText("Maintenant")).toBeTruthy();
    });

    it("sets slider value to the correct minute position", () => {
      render(<TimeSlider value={FIXED_DATE} onChange={vi.fn()} />);
      const slider = screen.getByRole("slider") as HTMLInputElement;
      // 14h30 = 14*60+30 = 870
      expect(slider.value).toBe("870");
    });

    it("sets slider min/max to 0 and 1439", () => {
      render(<TimeSlider value={FIXED_DATE} onChange={vi.fn()} />);
      const slider = screen.getByRole("slider") as HTMLInputElement;
      expect(slider.min).toBe("0");
      expect(slider.max).toBe("1439");
    });
  });

  describe("slider interaction", () => {
    it("calls onChange with a Date when slider value changes", () => {
      const onChange = vi.fn();
      render(<TimeSlider value={FIXED_DATE} onChange={onChange} />);
      const slider = screen.getByRole("slider");

      // Move to 10h00 = 600 minutes
      fireEvent.change(slider, { target: { value: "600" } });

      expect(onChange).toHaveBeenCalledOnce();
      const emitted: Date = onChange.mock.calls[0][0];
      expect(emitted).toBeInstanceOf(Date);
      expect(emitted.getHours()).toBe(10);
      expect(emitted.getMinutes()).toBe(0);
    });

    it("preserves the original date part when slider changes", () => {
      const onChange = vi.fn();
      render(<TimeSlider value={FIXED_DATE} onChange={onChange} />);
      fireEvent.change(screen.getByRole("slider"), { target: { value: "480" } }); // 08h00

      const emitted: Date = onChange.mock.calls[0][0];
      expect(emitted.getFullYear()).toBe(2024);
      expect(emitted.getMonth()).toBe(5); // June = 5
      expect(emitted.getDate()).toBe(21);
    });

    it("handles boundary value 0 (midnight)", () => {
      const onChange = vi.fn();
      render(<TimeSlider value={FIXED_DATE} onChange={onChange} />);
      fireEvent.change(screen.getByRole("slider"), { target: { value: "0" } });

      const emitted: Date = onChange.mock.calls[0][0];
      expect(emitted.getHours()).toBe(0);
      expect(emitted.getMinutes()).toBe(0);
    });

    it("handles boundary value 1439 (23h59)", () => {
      const onChange = vi.fn();
      render(<TimeSlider value={FIXED_DATE} onChange={onChange} />);
      fireEvent.change(screen.getByRole("slider"), { target: { value: "1439" } });

      const emitted: Date = onChange.mock.calls[0][0];
      expect(emitted.getHours()).toBe(23);
      expect(emitted.getMinutes()).toBe(59);
    });
  });

  describe("'Maintenant' button", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-08-15T09:00:00"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("calls onChange when clicked", () => {
      const onChange = vi.fn();
      render(<TimeSlider value={FIXED_DATE} onChange={onChange} />);
      fireEvent.click(screen.getByText("Maintenant"));
      expect(onChange).toHaveBeenCalledOnce();
    });

    it("emits a Date close to 'now'", () => {
      const onChange = vi.fn();
      render(<TimeSlider value={FIXED_DATE} onChange={onChange} />);
      fireEvent.click(screen.getByText("Maintenant"));

      const emitted: Date = onChange.mock.calls[0][0];
      expect(emitted).toBeInstanceOf(Date);
      // Should match the frozen system time (2024-08-15T09:00:00)
      expect(emitted.getHours()).toBe(9);
    });
  });
});
