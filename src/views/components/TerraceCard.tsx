"use client";

import type { TerraceWithSunInfo, SunStatus } from "@/types/terrace";

interface Props {
  terrace: TerraceWithSunInfo;
  selected: boolean;
  onClick: () => void;
}

const STATUS_DOT: Record<SunStatus, string> = {
  sunny:   "bg-amber-400",
  partial: "bg-orange-300",
  shady:   "bg-gray-300",
};

const STATUS_LABEL: Record<SunStatus, string> = {
  sunny:   "Plein soleil",
  partial: "Partiellement ensoleillé",
  shady:   "À l'ombre",
};

export default function TerraceCard({ terrace, selected, onClick }: Props) {
  return (
    <button
      role="listitem"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "w-full border-b border-gray-100 px-4 py-3 text-left",
        "transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400",
        "hover:bg-amber-50",
        selected ? "border-l-2 border-l-amber-400 bg-amber-50" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${STATUS_DOT[terrace.sunStatus]}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{terrace.name}</p>
          <p className="truncate text-xs text-gray-500">{terrace.address}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
            <span>{STATUS_LABEL[terrace.sunStatus]}</span>
            {terrace.distanceKm !== undefined && (
              <span>· {formatDistance(terrace.distanceKm)}</span>
            )}
            {terrace.sunRemainingMinutes !== null && (
              <span>· encore {formatMinutes(terrace.sunRemainingMinutes)}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
  }
  return `${minutes} min`;
}
