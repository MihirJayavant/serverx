import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Context } from "@hono/hono";
import type { McpRouter } from "./mcp-router.ts";
import { resultToMcp } from "./result-adapter.ts";

export type McpServerOptions = {
  name: string;
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
