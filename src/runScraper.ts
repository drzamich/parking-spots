import { Env, ParkingSpot } from "./types";
import { scrapeParkingSpots } from "./scrapeParkingSpots";

/**
 * Shared logic to scrape parking spots and save them to the D1 database.
 */
export async function runScraper(env: Env): Promise<{ count: number }> {
  let spots: ParkingSpot[] = [];
  try {
    spots = await scrapeParkingSpots();
  } catch (e) {
    console.log(`Unable to scrape. Error:`, e);
    throw e;
  }

  if (spots.length === 0) {
    console.log("No parking spots scraped.");
    return { count: 0 };
  }

  // Save each scraped spot to the D1 database.
  for (const spot of spots) {
    await env.parking_spots_db
      .prepare(
        "INSERT INTO parking_spots (location, free_spots, timestamp) VALUES (?, ?, ?)",
      )
      .bind(spot.location, spot.free_spots, spot.timestamp)
      .run();
  }

  console.log(
    `Successfully saved ${spots.length} parking spots to the database.`,
  );
  return { count: spots.length };
}
