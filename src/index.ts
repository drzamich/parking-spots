import { Env, ParkingSpot } from "./types";
import { scrapeParkingSpots } from "./scraper";

/**
 * Shared logic to scrape parking spots and save them to the D1 database.
 */
async function runScraper(env: Env): Promise<{ count: number }> {
  let spots: ParkingSpot[] = [];
  try {
    spots = await scrapeParkingSpots();
  } catch (e) {
    console.log(`Unable to scrape. Error:`, e);
  }

  console.log(spots);

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
      await runScraper(env);
    } catch (error) {
      console.error("Error during scheduled scraping:", error);
    }
  },

  /**
   * Fetch handler for debugging or manual triggering.
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Manual trigger via /scrape endpoint
    if (url.pathname === "/scrape") {
      try {
        const result = await runScraper(env);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Scraping completed. Saved ${result.count} spots.`,
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    return new Response(
      "Parking spot scraper worker is running. Use /scrape to trigger manually.",
    );
  },
};
