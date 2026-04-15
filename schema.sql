DROP TABLE IF EXISTS parking_spots;

CREATE TABLE IF NOT EXISTS parking_spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT NOT NULL,
  free_spots INTEGER NOT NULL,
  timestamp TEXT NOT NULL
);

-- Optional: Create an index for faster queries on location and timestamp.
CREATE INDEX IF NOT EXISTS idx_parking_spots_location_timestamp ON parking_spots (location, timestamp);
