export interface Env {
  parking_spots_db: D1Database;
}

export type Location = "krasinski" | "warynskiego";

export interface ParkingSpot {
  id?: number;
  location: Location;
  free_spots: number;
  timestamp: string;
}
