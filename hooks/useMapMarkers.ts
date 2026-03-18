"use client";

import { useEffect, useRef } from "react";
import type { TerraceWithSunInfo } from "@/domain/terrace";
import { buildPopupHtml } from "@/lib/popupContent";

type MapLibreModule = typeof import("maplibre-gl");

/**
 * Manages map markers lifecycle: clears old markers and adds new ones
 * whenever the terraces list or the filter changes.
 */
export function useMapMarkers(
  mapRef: React.MutableRefObject<import("maplibre-gl").Map | null>,
  maplibreRef: React.MutableRefObject<MapLibreModule | null>,
  terraces: TerraceWithSunInfo[],
  showSunnyOnly: boolean
): void {
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    const ml = maplibreRef.current;
    if (!map || !ml) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visible = showSunnyOnly ? terraces.filter((t) => t.isSunny) : terraces;

    visible.forEach((terrace) => {
      const el = buildMarkerElement(terrace);
      const popup = new ml.Popup({ offset: 20 }).setHTML(buildPopupHtml(terrace));

      const marker = new ml.Marker({ element: el })
        .setLngLat([terrace.lng, terrace.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapRef, maplibreRef, terraces, showSunnyOnly]);
}

function buildMarkerElement(terrace: TerraceWithSunInfo): HTMLDivElement {
  const el = document.createElement("div");
  el.className = [
    "w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer",
    "flex items-center justify-center text-base",
    terrace.isSunny ? "bg-amber-400" : "bg-gray-400",
  ].join(" ");
  el.title = terrace.name;
  el.textContent = terrace.isSunny ? "☀️" : "🌥";
  return el;
}
