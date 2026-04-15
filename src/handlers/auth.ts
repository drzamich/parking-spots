import { IRequest } from "itty-router";
import { Env } from "../types";

export const withAuth = async (request: IRequest, env: Env): Promise<Response | void> => {
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
};
