"use client";

import type { Filters } from "@/types/filters";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  hasUserPosition: boolean;
}

const SUN_CHIPS: { value: Filters["sunExposure"]; label: string }[] = [
  { value: "all",        label: "Toutes" },
  { value: "any-sun",   label: "Ensoleillées" },
  { value: "sunny-only", label: "Plein soleil" },
];

const MIN_SUN_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "—" },
  { value: 30,   label: "30 min" },
  { value: 60,   label: "1 h" },
  { value: 90,   label: "1 h 30" },
  { value: 120,  label: "2 h" },
];

export default function FilterBar({ filters, onChange, hasUserPosition }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Sun exposure chips */}
      {SUN_CHIPS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange({ ...filters, sunExposure: value })}
          aria-pressed={filters.sunExposure === value}
          className={[
            "rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
            filters.sunExposure === value
              ? "bg-amber-500 text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50",
          ].join(" ")}
        >
          {label}
        </button>
      ))}

      {/* Min sun remaining */}
      <select
        value={filters.minSunRemainingMinutes ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            minSunRemainingMinutes:
              e.target.value === "" ? null : Number(e.target.value),
          })
        }
        aria-label="Soleil restant minimum"
        className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:border-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {MIN_SUN_OPTIONS.map(({ value, label }) => (
          <option key={label} value={value ?? ""}>
            {label}
          </option>
        ))}
      </select>

      {/* Nearby only — only shown when position is available */}
      {hasUserPosition && (
        <button
          onClick={() => onChange({ ...filters, nearbyOnly: !filters.nearbyOnly })}
          aria-pressed={filters.nearbyOnly}
          className={[
            "rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
            filters.nearbyOnly
              ? "bg-amber-500 text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50",
          ].join(" ")}
        >
          À 1 km
        </button>
      )}
    </div>
  );
}
