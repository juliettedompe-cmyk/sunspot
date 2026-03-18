"use client";

import { useState, useCallback, useEffect } from "react";
import type { TerraceWithSunInfo } from "@/types/terrace";

const DEBOUNCE_MS = 300;

interface UseTerraces {
  terraces: TerraceWithSunInfo[];
  loading: boolean;
  error: string | null;
}

export function useTerraces(date: Date): UseTerraces {
  const [terraces, setTerraces] = useState<TerraceWithSunInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerraces = useCallback(async (d: Date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/terraces?datetime=${encodeURIComponent(d.toISOString())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TerraceWithSunInfo[] = await res.json();
      setTerraces(data);
    } catch (err) {
      setError("Impossible de charger les terrasses. Veuillez réessayer.");
      console.error("[useTerraces]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTerraces(date);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [date, fetchTerraces]);

  return { terraces, loading, error };
}
