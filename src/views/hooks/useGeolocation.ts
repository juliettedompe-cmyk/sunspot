"use client";

import { useState, useCallback, useRef } from "react";
import type { GeoPoint } from "@/services/distance";

interface GeolocationState {
  position: GeoPoint | null;
  loading: boolean;
  error: string | null;
  /** Whether the user has ever clicked "Autour de moi". */
  requested: boolean;
  /** Triggers geolocation on user intent (privacy-first). */
  request: () => void;
}

/**
 * On-demand geolocation — does NOT auto-start on mount.
 * Call `request()` to ask for permission and start watching.
 */
export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setRequested(true);
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    // Clear any existing watch before starting a new one
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLoading(true);
    setRequested(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Accès à la position refusé."
            : "Position non disponible."
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 30_000 }
    );
  }, []);

  return { position, loading, error, requested, request };
}
