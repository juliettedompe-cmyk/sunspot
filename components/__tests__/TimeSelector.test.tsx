import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeSelector from "../TimeSelector";

describe("TimeSelector", () => {
  const baseDate = new Date("2024-06-21T14:30:00");

  it("renders a datetime-local input", () => {
    render(<TimeSelector value={baseDate} onChange={vi.fn()} />);
    expect(screen.getByRole("textbox", { hidden: true })).toBeTruthy();
    const input = document.querySelector('input[type="datetime-local"]');
    expect(input).not.toBeNull();
  });

  it("renders the 'Maintenant' button", () => {
    render(<TimeSelector value={baseDate} onChange={vi.fn()} />);
    expect(screen.getByText("Maintenant")).toBeTruthy();
  });

  it("calls onChange with a valid Date when input changes", () => {
    const handleChange = vi.fn();
    render(<TimeSelector value={baseDate} onChange={handleChange} />);
    const input = document.querySelector('input[type="datetime-local"]')!;
    fireEvent.change(input, { target: { value: "2024-07-04T12:00" } });
    expect(handleChange).toHaveBeenCalledOnce();
    const emitted: Date = handleChange.mock.calls[0][0];
    expect(emitted).toBeInstanceOf(Date);
    expect(emitted.getFullYear()).toBe(2024);
    expect(emitted.getMonth()).toBe(6); // July = 6 (0-indexed)
  });

  it("calls onChange when 'Maintenant' button is clicked", () => {
    const handleChange = vi.fn();
    render(<TimeSelector value={baseDate} onChange={handleChange} />);
    fireEvent.click(screen.getByText("Maintenant"));
    expect(handleChange).toHaveBeenCalledOnce();
    const emitted: Date = handleChange.mock.calls[0][0];
    expect(emitted).toBeInstanceOf(Date);
  });
});
