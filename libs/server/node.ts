import { serve as nodeServe } from "@hono/node-server";
import type { Server } from "./server.ts";

/**
 * Options accepted by the Node.js {@link serve} adapter.
 */
export type NodeServeOptions = {
  port?: number;
  hostname?: string;
};

/**
 * Start the server on the Node.js runtime.
 *
 * Binds the server's universal `fetch` handler to `@hono/node-server`. For
 * Deno, import `serve` from `@serverx/server` instead.
 *
 * ```ts
 * import { Server } from "@serverx/server";
 * import { serve } from "@serverx/server/node";
 *
 * const app = new Server();
 * serve(app, { port: 3100 });
 * ```
 */
export function serve(
  server: Server,
  options: NodeServeOptions = {},
): ReturnType<typeof nodeServe> {
  return nodeServe({
    fetch: server.fetch,
    port: options.port,
    hostname: options.hostname,
  });
}
