import { IRequest } from "itty-router";
import { Env } from "../../types";

export const withAuth = async (request: IRequest, env: Env): Promise<Response | void> => {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized: Missing authentication cookie",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Very simple cookie parsing logic
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => cookie.split("=")),
  );

  const token = cookies["auth_token"];

  if (!token || token !== env.PASSWORD) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized: Invalid or expired session",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
