import { AutoRouter, IRequest } from "itty-router";
import { handleScrape } from "./api/scrape";
import { handleGetData } from "./api/getData";
import { withAuth } from "./api/middleware/auth";
import { Env } from "./types";

const router = AutoRouter();

// Protected API routes
router.get("/api/scrape", withAuth, handleScrape);
router.get("/api/getdata", withAuth, handleGetData);

// Fallback to static assets (frontend)
router.all(
  "*",
  (request: IRequest, env: Env) => {
    return env.ASSETS.fetch(request);
  }
);

export { router };
