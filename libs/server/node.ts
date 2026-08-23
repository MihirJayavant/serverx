/**
 * @module Node
 * Node.js runtime adapter — binds a {@link Server} to `@hono/node-server`
 */

import { serve as nodeServe } from "@hono/node-server";
import type { Server } from "./server.ts";

/**
 * Options accepted by the Node.js {@link serve} adapter.
 */
export type NodeServeOptions = {
  /** Port to listen on. Defaults to `3000` (the `@hono/node-server` default). */
  port?: number;
  /** Hostname to bind to. Defaults to all interfaces. */
  hostname?: string;
};

/**
 * Start the server on the Node.js runtime.
 *
 * Binds the server's universal `fetch` handler to `@hono/node-server`. For
 * Deno, import `serve` from `@serverx/server/deno` instead.
 *
 * @param server - The configured {@link Server} to serve.
 * @param options - Port and hostname to bind.
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
