export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Returns the great-circle distance in kilometers between two geographic points.
 * Uses the haversine formula — accurate enough for city-scale distances.
 */
export function calculateDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const EARTH_RADIUS_KM = 6371;

  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
