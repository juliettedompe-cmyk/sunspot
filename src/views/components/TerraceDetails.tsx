"use client";

import type { TerraceWithSunInfo, SunStatus } from "@/types/terrace";

interface Props {
  terrace: TerraceWithSunInfo;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  SunStatus,
  { label: string; icon: string; bg: string; badge: string }
> = {
  sunny:   { label: "Plein soleil",             icon: "☀️", bg: "bg-amber-50",  badge: "bg-amber-100 text-amber-700" },
  partial: { label: "Partiellement ensoleillé", icon: "🌤", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
  shady:   { label: "À l'ombre",                icon: "🌥", bg: "bg-gray-50",   badge: "bg-gray-100 text-gray-600" },
};

export default function TerraceDetails({ terrace, onClose }: Props) {
  const cfg = STATUS_CONFIG[terrace.sunStatus];

  return (
    <div className={`rounded-2xl ${cfg.bg} p-5`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 leading-snug">{terrace.name}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{terrace.address}</p>
          {terrace.distanceKm !== undefined && (
            <p className="mt-0.5 text-xs text-gray-400">{formatDistance(terrace.distanceKm)}</p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-white/60 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sun status badge */}
      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cfg.badge}`}>
        <span aria-hidden="true">{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>

      {/* Sun remaining */}
      {terrace.sunRemainingMinutes !== null && (
        <p className="mt-2 text-xs text-gray-500">
          Encore environ{" "}
          <span className="font-semibold text-gray-700">
            {formatMinutes(terrace.sunRemainingMinutes)}
          </span>{" "}
          de soleil
        </p>
      )}

      {/* Open hours */}
      {terrace.openHours && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <span aria-hidden="true">🕐</span>
          <span>{terrace.openHours}</span>
        </div>
      )}
    </div>
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
