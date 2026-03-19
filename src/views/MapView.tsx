"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTerraces } from "@/views/hooks/useTerraces";
import { useMapLibre } from "@/views/hooks/useMapLibre";
import { useMapMarkers } from "@/views/hooks/useMapMarkers";
import { useGeolocation } from "@/views/hooks/useGeolocation";
import { useTerraceDistance } from "@/views/hooks/useTerraceDistance";
import { useUserMarker } from "@/views/hooks/useUserMarker";
import { applyFilters } from "@/services/terraceFilters";
import { DEFAULT_FILTERS, type Filters } from "@/types/filters";
import type { TerraceWithSunInfo } from "@/types/terrace";
import FilterBar from "./components/FilterBar";
import LocationButton from "./components/LocationButton";
import StatusBar from "./components/StatusBar";
import TerraceDetails from "./components/TerraceDetails";
import TerraceList from "./components/TerraceList";
import TimeSlider from "./components/TimeSlider";

/**
 * Root view — orchestrates state and composes the split-panel layout.
 * No business logic here: filtering and sun calculations happen in services/hooks.
 *
 * Desktop: left sidebar (controls + list) + right map.
 * Mobile: stacked — controls → map → scrollable list below.
 */
export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDatetime, setSelectedDatetime] = useState<Date>(new Date());
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedTerrace, setSelectedTerrace] = useState<TerraceWithSunInfo | null>(null);

  const { terraces, loading, error } = useTerraces(selectedDatetime);
  const { mapRef, maplibreRef } = useMapLibre(containerRef);
  const {
    position: userPosition,
    loading: geoLoading,
    error: geoError,
    requested: geoRequested,
    request: requestGeo,
  } = useGeolocation();

  const terracesWithDistance = useTerraceDistance(terraces, userPosition);
  const filteredTerraces = applyFilters(terracesWithDistance, filters, userPosition);

  useUserMarker(mapRef, maplibreRef, userPosition);
  useMapMarkers(mapRef, maplibreRef, filteredTerraces, setSelectedTerrace);

  const sunnyCount   = filteredTerraces.filter((t) => t.sunStatus === "sunny").length;
  const partialCount = filteredTerraces.filter((t) => t.sunStatus === "partial").length;

  function handleSelect(terrace: TerraceWithSunInfo) {
    setSelectedTerrace(terrace);
  }

  function handleClose() {
    setSelectedTerrace(null);
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="flex w-full flex-shrink-0 flex-col bg-white lg:w-80 lg:border-r lg:border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="SunSpot logo"
              width={36}
              height={36}
              className="flex-shrink-0 drop-shadow-sm"
              priority
            />
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900">
                <span className="text-amber-500">Sun</span>Spot
              </h1>
              <p className="text-xs text-gray-400">Terrasses ensoleillées à Paris</p>
            </div>
          </div>
          <LocationButton
            position={userPosition}
            loading={geoLoading}
            requested={geoRequested}
            error={geoError}
            onRequest={requestGeo}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3">
          <TimeSlider value={selectedDatetime} onChange={setSelectedDatetime} />
          <FilterBar
            filters={filters}
            onChange={setFilters}
            hasUserPosition={userPosition !== null}
          />
          <StatusBar
            loading={loading}
            error={error}
            totalCount={filteredTerraces.length}
            sunnyCount={sunnyCount}
            partialCount={partialCount}
          />
        </div>

        {/* List / Details — desktop only */}
        <div className="hidden min-h-0 flex-1 overflow-y-auto lg:flex lg:flex-col">
          {selectedTerrace ? (
            <div className="p-4">
              <TerraceDetails terrace={selectedTerrace} onClose={handleClose} />
            </div>
          ) : (
            <TerraceList
              terraces={filteredTerraces}
              selectedId={null}
              onSelect={handleSelect}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </aside>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[50vh] flex-1">
        {/* MapLibre attaches here */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* TerraceDetails overlay — mobile only */}
        {selectedTerrace && (
          <div className="absolute bottom-4 left-4 right-4 z-20 lg:hidden">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="p-4">
                <TerraceDetails terrace={selectedTerrace} onClose={handleClose} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile TerraceList (below map) ──────────────────────────────── */}
      <div className="max-h-52 overflow-y-auto border-t border-gray-100 bg-white lg:hidden">
        {!selectedTerrace && (
          <TerraceList
            terraces={filteredTerraces}
            selectedId={null}
            onSelect={handleSelect}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
