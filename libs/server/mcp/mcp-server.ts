/**
 * @file mcp-server.ts
 * Stateless Streamable HTTP transport serving registered MCP tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Context } from "@hono/hono";
import type { McpRouter } from "./mcp-router.ts";
import { resultToMcp } from "./result-adapter.ts";

/** Identity reported by the MCP server to connecting clients. */
export type McpServerOptions = {
  /** Server name advertised to MCP clients. */
  name: string;
  /** Server version advertised to MCP clients. */
  version: string;
};

function buildServer(
  routers: readonly McpRouter[],
  options: McpServerOptions,
): McpServer {
  const mcp = new McpServer({ name: options.name, version: options.version });

  for (const router of routers) {
    for (const tool of router.tools) {
      mcp.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema,
          ...(tool.annotations ? { annotations: tool.annotations } : {}),
        },
        async (input: unknown) => {
          const result = await tool.handler(input);
          return resultToMcp(result);
        },
      );
    }
  }

  return mcp;
}

/**
 * Build a stateless request handler that serves the given {@link McpRouter}s
 * over a Streamable HTTP MCP transport. A fresh server and transport are
 * created per request and torn down once the response is produced.
 *
 * Statelessness means no session is carried between requests, so tools must not
 * rely on server-side state surviving a call. Prefer {@link Server.addMcp},
 * which builds and mounts this handler; use it directly only to mount the
 * transport on a router of your own.
 *
 * @param routers - Routers whose tools are exposed; read on each request, so
 * routers registered later are still picked up.
 * @param options - Name and version advertised to connecting MCP clients.
 *
 * @example
 * ```ts
 * const handler = createMcpHandler([userMcpRouter], {
 *   name: "user-api",
 *   version: "1.0.0",
 * });
 * ```
 */
export function createMcpHandler(
  routers: readonly McpRouter[],
  options: McpServerOptions,
): (c: Context) => Promise<Response> {
  return async (c: Context) => {
    const mcp = buildServer(routers, options);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    try {
      await mcp.connect(transport);
      return await transport.handleRequest(c.req.raw);
    } finally {
      await transport.close();
      await mcp.close();
    }
  };
}
