"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/views/MapView"), { ssr: false });

export default function HomePage() {
  return (
    <main className="h-screen w-full">
      <MapView />
    </main>
  );
}
