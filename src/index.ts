import { Env } from "./types";
import { runScraper } from "./runScraper";
import { router } from "./router";

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
