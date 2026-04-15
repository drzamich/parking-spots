import { AutoRouter } from "itty-router";
import { Env } from "./types";
import { runScraper } from "./runScraper";
import { handleScrape } from "./handlers/scrape";
import { handleGetData } from "./handlers/getData";

const router = AutoRouter();

router.get("/scrape", handleScrape);
router.get("/getdata", handleGetData);

router.all(
  "*",
  () =>
    new Response(
      "Parking spot scraper worker is running. Use /scrape to trigger manually or /getdata to retrieve records.",
      { status: 404 },
    ),
);

export default {
  /**
   * Cloudflare Worker scheduled event handler.
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
   * Fetch handler for HTTP requests.
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return router.fetch(request, env, ctx);
  },
};
