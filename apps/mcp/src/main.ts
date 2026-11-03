import { Hono } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { serve } from "@hono/node-server";

// The MCP server only retrieves and audits; it never ingests, so
// LLAMA_CLOUD_API_KEY and GEMINI_EXTRACTION_MODEL are not needed here.
const REQUIRED_ENV_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VOYAGE_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[Synapse MCP] Missing required environment variables: ${missing.join(", ")}`,
  );
  console.error(
    "[Synapse MCP] Copy apps/mcp/.env.example to apps/mcp/.env and fill in the values.",
  );
  process.exit(1);
}

process.on("uncaughtException", (err) => {
  console.error("[Synapse MCP] Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Synapse MCP] Unhandled promise rejection:", reason);
  process.exit(1);
});

// Imported after the env check on purpose: @synapse/core reads (and throws on)
// missing Supabase vars at import time, which would bypass the message above.
const { createMcpServer } = await import("@/server");

const app = new Hono();

app.all("/mcp", async (c) => {
  try {
    const server = createMcpServer();
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    return transport.handleRequest(c);
  } catch (err) {
    console.error("[Synapse MCP] Request handler failed:", err);
    return c.json(
      {
        error: "MCP server error",
        message: err instanceof Error ? err.message : "Unexpected server error",
      },
      500,
    );
  }
});

app.all("*", (c) =>
  c.json(
    { error: "Not found", message: "Only /mcp is served by this server." },
    404,
  ),
);

const port = Number(process.env.PORT) || 7000;

serve({ fetch: app.fetch, port }, () => {
  console.error(`[Synapse MCP] Server running on http://localhost:${port}/mcp`);
});
