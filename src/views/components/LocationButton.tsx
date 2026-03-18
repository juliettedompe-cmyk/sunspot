"use client";

import type { GeoPoint } from "@/services/distance";

interface Props {
  position: GeoPoint | null;
  loading: boolean;
  requested: boolean;
  error: string | null;
  onRequest: () => void;
}

export default function LocationButton({
  position,
  loading,
  requested,
  error,
  onRequest,
}: Props) {
  if (loading) {
    return (
      <button
        disabled
        aria-label="Localisation en cours"
        className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white opacity-75 cursor-wait"
      >
        <span
          className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"
          aria-hidden="true"
        />
        Localisation…
      </button>
    );
  }

  if (position) {
    return (
      <button
        onClick={onRequest}
        aria-label="Recentrer sur ma position"
        className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
      >
        <span aria-hidden="true">📍</span>
        Autour de moi
      </button>
    );
  }

  if (error && requested) {
    return (
      <button
        onClick={onRequest}
        title={error}
        aria-label="Position non disponible — réessayer"
        className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
      >
        <span aria-hidden="true">📍</span>
        Position indisponible
      </button>
    );
  }

  return (
    <button
      onClick={onRequest}
      aria-label="Activer la géolocalisation"
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-colors"
    >
      <span aria-hidden="true">📍</span>
      Autour de moi
    </button>
  );
}
