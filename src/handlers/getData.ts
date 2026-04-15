import { IRequest } from "itty-router";
import { Env } from "../types";

export const handleGetData = async (request: IRequest, env: Env): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

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
};
