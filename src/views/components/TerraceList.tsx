"use client";

import type { TerraceWithSunInfo } from "@/types/terrace";
import TerraceCard from "./TerraceCard";

interface Props {
  terraces: TerraceWithSunInfo[];
  selectedId: string | null;
  onSelect: (terrace: TerraceWithSunInfo) => void;
  loading: boolean;
  error: string | null;
}

export default function TerraceList({
  terraces,
  selectedId,
  onSelect,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-0" aria-label="Chargement des terrasses">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-gray-100 px-4 py-3"
            aria-hidden="true"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-6 text-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (terraces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <span className="text-3xl" aria-hidden="true">🌥</span>
        <p className="mt-2 text-sm font-medium text-gray-700">Aucune terrasse trouvée</p>
        <p className="mt-1 text-xs text-gray-400">
          Essayez d&apos;ajuster les filtres ou de changer l&apos;heure.
        </p>
      </div>
    );
  }

  return (
    <div role="list" aria-label="Liste des terrasses">
      {terraces.map((terrace) => (
        <TerraceCard
          key={terrace.id}
          terrace={terrace}
          selected={terrace.id === selectedId}
          onClick={() => onSelect(terrace)}
        />
      ))}
    </div>
  );
}
