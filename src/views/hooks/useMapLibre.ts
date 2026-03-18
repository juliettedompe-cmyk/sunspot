"use client";

import { useEffect, useRef } from "react";

const PARIS_CENTER: [number, number] = [2.3522, 48.8566];
const INITIAL_ZOOM = 13;
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type MapLibreModule = typeof import("maplibre-gl");

interface UseMapLibre {
  mapRef: React.MutableRefObject<import("maplibre-gl").Map | null>;
  maplibreRef: React.MutableRefObject<MapLibreModule | null>;
}

/**
 * Initializes a MapLibre map inside the given container ref.
 * Handles dynamic import (browser-only) and cleanup on unmount.
 */
export function useMapLibre(containerRef: React.RefObject<HTMLDivElement | null>): UseMapLibre {
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const maplibreRef = useRef<MapLibreModule | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    async function initMap() {
      const ml = await import("maplibre-gl");
      maplibreRef.current = ml;

      if (!containerRef.current) return;

      mapRef.current = new ml.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: PARIS_CENTER,
        zoom: INITIAL_ZOOM,
      });
    }

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [containerRef]);

  return { mapRef, maplibreRef };
}
