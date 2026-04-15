import { IRequest } from "itty-router";
import { Env } from "../types";

export const handleGetData = async (request: IRequest, env: Env): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const locationsParam = searchParams.get("location");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!locationsParam || !from || !to) {
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

  const locations = locationsParam.split(",");

  try {
    // Construct the IN clause placeholders
    const placeholders = locations.map(() => "?").join(",");
    const query = `SELECT * FROM parking_spots WHERE location IN (${placeholders}) AND datetime(timestamp) BETWEEN datetime(?) AND datetime(?) ORDER BY timestamp DESC`;

    const { results } = await env.parking_spots_db
      .prepare(query)
      .bind(...locations, from, to)
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
};
