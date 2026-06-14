import type { Server } from "./server.ts";

/**
 * Start the server on the Deno runtime.
 *
 * Thin wrapper over {@link Deno.serve} that binds the server's universal
 * `fetch` handler. For Node.js, import `serve` from `@serverx/server/node`
 * instead.
 *
 * ```ts
 * import { Server } from "@serverx/server";
 * import { serve } from "@serverx/server/deno";
 *
 * const app = new Server();
 * serve(app, { port: 3100 });
 * ```
 */
export function serve(
  server: Server,
  options:
    | Deno.ServeTcpOptions
    | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem),
): Deno.HttpServer<Deno.NetAddr> {
  return Deno.serve(options, server.fetch);
}
