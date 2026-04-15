export interface Env {
  parking_spots_db: D1Database;
}

type Location = "krasinski" | "warynskiego";

interface ParkingSpot {
  id?: number;
  location: Location;
  free_spots: number;
  timestamp: string;
}

/**
 * Mock function to scrape free parking spots.
 * For now, returns an empty array.
 */
async function scrapeParkingSpots(): Promise<ParkingSpot[]> {
  // TODO: Implement actual scraping logic.
  return [
    {
      location: "krasinski",
      free_spots: 132,
      timestamp: Date.now().toString(),
    },
  ];
}

export default {
  /**
   * Cloudflare Worker scheduled event handler.
   * Runs every 30 minutes (based on crons in wrangler.toml).
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log(
      `Cron triggered at ${new Date(event.scheduledTime).toISOString()}`,
    );

    try {
      const spots = await scrapeParkingSpots();

      if (spots.length === 0) {
        console.log("No parking spots scraped.");
        return;
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
    } catch (error) {
      console.error("Error during scraping or database operation:", error);
    }
  },

  /**
   * Optional: Fetch handler for debugging or manual triggering.
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return new Response("Parking spot scraper worker is running.");
  },
};
