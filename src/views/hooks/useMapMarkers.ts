"use client";

import { useEffect, useRef } from "react";
import type { TerraceWithSunInfo, SunStatus } from "@/types/terrace";
import { buildPopupHtml } from "@/lib/popupContent";

type MapLibreModule = typeof import("maplibre-gl");

const MARKER_STYLE: Record<SunStatus, { bg: string; icon: string }> = {
  sunny:   { bg: "bg-amber-400",  icon: "☀️" },
  partial: { bg: "bg-orange-300", icon: "🌤" },
  shady:   { bg: "bg-gray-400",   icon: "🌥" },
};

/**
 * Manages map markers lifecycle.
 * Receives already-filtered terraces — no filtering logic inside this hook.
 */
export function useMapMarkers(
  mapRef: React.MutableRefObject<import("maplibre-gl").Map | null>,
  maplibreRef: React.MutableRefObject<MapLibreModule | null>,
  terraces: TerraceWithSunInfo[],
  onSelect: (terrace: TerraceWithSunInfo) => void
): void {
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    const ml = maplibreRef.current;
    if (!map || !ml) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    terraces.forEach((terrace) => {
      const el = buildMarkerElement(terrace);
      el.addEventListener("click", () => onSelect(terrace));

      const popup = new ml.Popup({ offset: 20 }).setHTML(buildPopupHtml(terrace));

      const marker = new ml.Marker({ element: el })
        .setLngLat([terrace.lng, terrace.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapRef, maplibreRef, terraces, onSelect]);
}

function buildMarkerElement(terrace: TerraceWithSunInfo): HTMLDivElement {
  const { bg, icon } = MARKER_STYLE[terrace.sunStatus];
  const el = document.createElement("div");
  el.className = [
    "w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer",
    "flex items-center justify-center text-base",
    bg,
  ].join(" ");
  el.title = terrace.name;
  el.textContent = icon;
  return el;
}
