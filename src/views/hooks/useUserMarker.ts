"use client";

import { useEffect, useRef } from "react";
import type { GeoPoint } from "@/services/distance";

type MapLibreModule = typeof import("maplibre-gl");

/**
 * Renders a distinct marker for the user's position.
 * Updates automatically when position changes.
 */
export function useUserMarker(
  mapRef: React.MutableRefObject<import("maplibre-gl").Map | null>,
  maplibreRef: React.MutableRefObject<MapLibreModule | null>,
  position: GeoPoint | null
): void {
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    const ml = maplibreRef.current;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (!map || !ml || !position) return;

    const el = buildUserMarkerElement();
    markerRef.current = new ml.Marker({ element: el })
      .setLngLat([position.lng, position.lat])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [mapRef, maplibreRef, position]);
}

function buildUserMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = [
    "w-5 h-5 rounded-full border-2 border-white shadow-lg",
    "bg-blue-500",
  ].join(" ");
  el.title = "Votre position";
  return el;
}
