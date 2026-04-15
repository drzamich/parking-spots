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
      const password = url.searchParams.get("password");
      if (password !== env.PASSWORD) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized: Invalid password",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

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

    // Endpoint to retrieve data from the parking_spots table
    if (url.pathname === "/getdata") {
      const location = url.searchParams.get("location");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");

      if (!location || !from || !to) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing required parameters: location, from, to",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      try {
        const { results } = await env.parking_spots_db
          .prepare(
            "SELECT * FROM parking_spots WHERE location = ? AND datetime(timestamp) BETWEEN datetime(?) AND datetime(?) ORDER BY timestamp DESC",
          )
          .bind(location, from, to)
          .all();

        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" },
        });
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
      "Parking spot scraper worker is running. Use /scrape to trigger manually or /getdata to retrieve records.",
    );
  },
};
