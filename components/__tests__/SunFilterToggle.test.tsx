import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SunFilterToggle from "../SunFilterToggle";

describe("SunFilterToggle", () => {
  it("renders with correct aria-checked=false when off", () => {
    render(<SunFilterToggle value={false} onChange={vi.fn()} />);
    const button = screen.getByRole("switch");
    expect(button.getAttribute("aria-checked")).toBe("false");
  });

  it("renders with correct aria-checked=true when on", () => {
    render(<SunFilterToggle value={true} onChange={vi.fn()} />);
    const button = screen.getByRole("switch");
    expect(button.getAttribute("aria-checked")).toBe("true");
  });

  it("calls onChange with true when toggled from off", () => {
    const handleChange = vi.fn();
    render(<SunFilterToggle value={false} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when toggled from on", () => {
    const handleChange = vi.fn();
    render(<SunFilterToggle value={true} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("displays the label text", () => {
    render(<SunFilterToggle value={false} onChange={vi.fn()} />);
    expect(screen.getByText("Terrasses ensoleillées uniquement")).toBeTruthy();
  });
});
