"use client";

interface SunFilterToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * Toggle switch: show all terraces vs sunny terraces only.
 */
export default function SunFilterToggle({ value, onChange }: SunFilterToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        value
          ? "border-amber-400 bg-amber-50 text-amber-700"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full ${
          value ? "bg-amber-400" : "bg-gray-300"
        }`}
        aria-hidden="true"
      />
      Terrasses ensoleillées uniquement
    </button>
  );
}
