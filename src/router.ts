import { AutoRouter, IRequest } from "itty-router";
import { handleScrape } from "./api/handleScrape";
import { handleGetData } from "./api/handleGetData";
import { handleLogin } from "./api/handleLogin";
import { withAuth } from "./api/middleware/withAuth";
import { Env } from "./types";

const router = AutoRouter();

// Authentication endpoint
router.post("/api/auth", handleLogin);

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
