"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TerraceWithSunInfo } from "@/domain/terrace";
import TimeSelector from "./TimeSelector";
import SunFilterToggle from "./SunFilterToggle";

// MapLibre is a browser-only library — imported dynamically to avoid SSR issues
let maplibregl: typeof import("maplibre-gl") | null = null;

const PARIS_CENTER: [number, number] = [2.3522, 48.8566];
const INITIAL_ZOOM = 13;
// OpenFreeMap — free, no API key required
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);

  const [selectedDatetime, setSelectedDatetime] = useState<Date>(new Date());
  const [showSunnyOnly, setShowSunnyOnly] = useState(false);
  const [terraces, setTerraces] = useState<TerraceWithSunInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch terraces from the API whenever the selected datetime changes
  const fetchTerraces = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/terraces?datetime=${encodeURIComponent(date.toISOString())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TerraceWithSunInfo[] = await res.json();
      setTerraces(data);
    } catch (err) {
      setError("Impossible de charger les terrasses. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced datetime change to avoid rapid re-fetches while using the picker
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTerraces(selectedDatetime);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedDatetime, fetchTerraces]);

  // Initialize MapLibre on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    async function initMap() {
      const ml = await import("maplibre-gl");
      maplibregl = ml;

      const map = new ml.Map({
        container: mapContainerRef.current!,
        style: MAP_STYLE,
        center: PARIS_CENTER,
        zoom: INITIAL_ZOOM,
      });

      mapRef.current = map;
    }

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever terraces or filter changes
  useEffect(() => {
    if (!mapRef.current || !maplibregl) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visible = showSunnyOnly ? terraces.filter((t) => t.isSunny) : terraces;

    visible.forEach((terrace) => {
      if (!maplibregl || !mapRef.current) return;

      // Custom marker element
      const el = document.createElement("div");
      el.className = [
        "w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer",
        "flex items-center justify-center text-base",
        terrace.isSunny ? "bg-amber-400" : "bg-gray-400",
      ].join(" ");
      el.title = terrace.name;
      el.textContent = terrace.isSunny ? "☀️" : "🌥";

      // Popup content
      const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
        <div class="text-sm">
          <p class="font-semibold">${escapeHtml(terrace.name)}</p>
          <p class="text-gray-500">${escapeHtml(terrace.address)}</p>
          ${terrace.openHours ? `<p class="mt-1 text-gray-600">🕐 ${escapeHtml(terrace.openHours)}</p>` : ""}
          <p class="mt-1 font-medium ${terrace.isSunny ? "text-amber-600" : "text-gray-500"}">
            ${terrace.isSunny ? "☀️ Ensoleillée" : "🌥 À l'ombre"}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Soleil : ${terrace.sunAltitudeDeg.toFixed(1)}° · Az. ${terrace.sunAzimuthDeg.toFixed(0)}°
          </p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([terrace.lng, terrace.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [terraces, showSunnyOnly]);

  const sunnyCount = terraces.filter((t) => t.isSunny).length;

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Controls overlay */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-2 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <TimeSelector value={selectedDatetime} onChange={setSelectedDatetime} />
          <SunFilterToggle value={showSunnyOnly} onChange={setShowSunnyOnly} />
        </div>

        {/* Status */}
        {loading && (
          <div className="rounded-lg bg-white/90 px-3 py-2 text-sm text-gray-500 shadow backdrop-blur-sm">
            Chargement…
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 shadow">
            {error}
          </div>
        )}
        {!loading && !error && terraces.length > 0 && (
          <div className="rounded-lg bg-white/90 px-3 py-2 text-sm shadow backdrop-blur-sm">
            <span className="text-amber-600 font-medium">{sunnyCount} ensoleillée{sunnyCount !== 1 ? "s" : ""}</span>
            <span className="text-gray-400"> / {terraces.length} terrasses</span>
          </div>
        )}
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
