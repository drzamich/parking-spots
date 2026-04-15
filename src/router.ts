import { AutoRouter } from "itty-router";
import { handleScrape } from "./handlers/scrape";
import { handleGetData } from "./handlers/getData";
import { withAuth } from "./handlers/auth";

const router = AutoRouter();

router.all("*", withAuth);

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

export { router };
