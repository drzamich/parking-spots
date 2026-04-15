import { IRequest } from "itty-router";
import { Env } from "../types";

export const handleLogin = async (request: IRequest, env: Env): Promise<Response> => {
  const { password } = await request.json() as { password?: string };

  if (password !== env.PASSWORD) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid password" }),
      { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }

  // Set an HttpOnly, Secure, SameSite=Strict cookie
  // In a real app, you'd use a JWT or a session ID, but for this simple 
  // implementation, we'll use the PASSWORD itself as the token for simplicity.
  // Because it's HttpOnly, the user's browser JS cannot read it.
  const cookie = `auth_token=${env.PASSWORD}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`;

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      }
    }
  );
};
