-- SunSpot — initial schema
-- Run this in the Supabase SQL editor for project trmwcrkwbdjzvtyopmrc

-- PostGIS is already enabled on Supabase, but just in case:
CREATE EXTENSION IF NOT EXISTS postgis;

-- Main table
CREATE TABLE IF NOT EXISTS terraces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  location    GEOGRAPHY(POINT, 4326) NOT NULL,
  -- Direction the terrace FACES (where customers look out toward).
  -- 0=North, 90=East, 180=South, 270=West.
  -- A terrace is sunny when the sun comes from roughly the same direction.
  orientation SMALLINT NOT NULL CHECK (orientation >= 0 AND orientation <= 359),
  open_hours  TEXT,             -- e.g. "07:30-01:30", nullable
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for future bounding-box queries
CREATE INDEX IF NOT EXISTS terraces_location_idx
  ON terraces USING GIST (location);

-- View that exposes lat/lng as plain floats — avoids PostGIS parsing in the app layer
CREATE OR REPLACE VIEW terraces_with_coords AS
  SELECT
    id,
    name,
    address,
    orientation,
    open_hours,
    ST_Y(location::geometry) AS lat,
    ST_X(location::geometry) AS lng
  FROM terraces;

-- Row Level Security: read-only for anonymous users (anon key)
ALTER TABLE terraces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terraces_select_anon"
  ON terraces FOR SELECT
  TO anon
  USING (true);
