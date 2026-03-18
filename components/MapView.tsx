"use client";

import { useRef, useState } from "react";
import { useTerraces } from "@/hooks/useTerraces";
import { useMapLibre } from "@/hooks/useMapLibre";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import TimeSelector from "./TimeSelector";
import SunFilterToggle from "./SunFilterToggle";
import StatusBar from "./StatusBar";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDatetime, setSelectedDatetime] = useState<Date>(new Date());
  const [showSunnyOnly, setShowSunnyOnly] = useState(false);

  const { terraces, loading, error } = useTerraces(selectedDatetime);
  const { mapRef, maplibreRef } = useMapLibre(containerRef);
  useMapMarkers(mapRef, maplibreRef, terraces, showSunnyOnly);

  const sunnyCount = terraces.filter((t) => t.isSunny).length;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-2 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <TimeSelector value={selectedDatetime} onChange={setSelectedDatetime} />
          <SunFilterToggle value={showSunnyOnly} onChange={setShowSunnyOnly} />
        </div>

        <StatusBar
          loading={loading}
          error={error}
          totalCount={terraces.length}
          sunnyCount={sunnyCount}
        />
      </div>
    </div>
  );
}
