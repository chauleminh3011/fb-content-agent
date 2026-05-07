import type { NextRequest } from "next/server";

export function validateAgentRequest(req: NextRequest) {
  const expected = process.env.PIPELINE_AGENT_TOKEN;
  if (!expected) return null;

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerToken = req.headers.get("x-pipeline-token");
  const provided = bearer || headerToken;

  if (provided === expected) return null;

  return new Response(JSON.stringify({ error: "Unauthorized pipeline agent request" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
