import { IRequest } from "itty-router";
import { Env } from "../types";

export const handleAuthCheck = async (_request: IRequest, _env: Env): Promise<Response> => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
