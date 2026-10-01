/**
 * @file cors.ts
 * Re-export of Hono's CORS middleware
 */

/**
 * Build a CORS middleware. Re-exported from Hono unchanged — pass the result
 * to `Server.addMiddleware` or `Router.addMiddleware`.
 *
 * @example
 * ```ts
 * app.addMiddleware(cors({ origin: "https://example.com" }));
 * ```
 */
export { cors } from "@hono/hono/cors";
