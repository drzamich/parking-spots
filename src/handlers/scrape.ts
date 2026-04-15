import { IRequest } from "itty-router";
import { Env } from "../types";
import { runScraper } from "../runScraper";

export const handleScrape = async (request: IRequest, env: Env): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");

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
};
