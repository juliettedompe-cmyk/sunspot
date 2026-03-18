export interface Terrace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Direction the terrace faces, in degrees (0=N, 90=E, 180=S, 270=W) */
  orientation: number;
  openHours?: string;
}

export interface TerraceWithSunInfo extends Terrace {
  isSunny: boolean;
  sunAzimuthDeg: number;
  sunAltitudeDeg: number;
}
