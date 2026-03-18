-- SunSpot — schema v2
-- Supabase project: trmwcrkwbdjzvtyopmrc
-- Run in the Supabase SQL editor or via `supabase db push`

-- PostGIS is pre-installed on Supabase; this is idempotent.
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop previous iteration if re-applying from scratch
DROP VIEW  IF EXISTS terraces_with_coords;
DROP TABLE IF EXISTS terraces;

-- ---------------------------------------------------------------------------
-- Main table
-- ---------------------------------------------------------------------------
CREATE TABLE terraces (
  id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT             NOT NULL,
  address     TEXT             NOT NULL,

  -- Explicit float columns for direct app consumption (no PostGIS parsing needed)
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,

  -- Derived spatial column — kept in sync automatically via generated column.
  -- Used for ST_DWithin / ST_Distance queries and the GiST index.
  -- longitude comes first (ST_MakePoint is x/y = lng/lat).
  geom        GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
              ) STORED,

  -- Direction the terrace FACES (where customers look out toward).
  -- 0 = North, 90 = East, 180 = South, 270 = West.
  orientation SMALLINT         NOT NULL CHECK (orientation >= 0 AND orientation <= 359),

  open_hours  TEXT,                           -- e.g. "07:30–01:30", nullable

  venue_type  TEXT             NOT NULL DEFAULT 'bar',  -- bar, restaurant, café, brasserie …
  source      TEXT             NOT NULL DEFAULT 'manual',  -- manual | osm | google_places …
  source_id   TEXT,                           -- external identifier (e.g. OSM way ID)

  is_active   BOOLEAN          NOT NULL DEFAULT true,

  created_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- Spatial index — powers ST_DWithin / ST_Distance "nearby" queries
CREATE INDEX terraces_geom_idx
  ON terraces USING GIST (geom);

-- Partial index on is_active — the default query filter
CREATE INDEX terraces_active_idx
  ON terraces (is_active) WHERE is_active = true;

-- Dedup guard: same external place cannot be imported twice from the same source
CREATE UNIQUE INDEX terraces_source_source_id_idx
  ON terraces (source, source_id)
  WHERE source_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Auto-update updated_at on every row modification
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER terraces_updated_at
  BEFORE UPDATE ON terraces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE terraces ENABLE ROW LEVEL SECURITY;

-- Anonymous (publishable key) users can read active terraces only
CREATE POLICY "terraces_select_anon"
  ON terraces FOR SELECT
  TO anon
  USING (is_active = true);
