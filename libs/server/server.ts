/**
 * @file server.ts
 * Top-level server that aggregates routers, docs, middlewares, and MCP tools
 */

import { Hono } from "@hono/hono";
import type { Context, Next } from "@hono/hono";
import { type Action, Router } from "./router/router.ts";
import { OpenApi, type OpenApiUiOption } from "@serverx/utils";
import type { HealthCheckResponse } from "./handlers/healthcheck.ts";
import type { McpRouter } from "./mcp/mcp-router.ts";
import { createMcpHandler, type McpServerOptions } from "./mcp/mcp-server.ts";

/**
 * Options for mounting the MCP transport via {@link Server.addMcp}.
 *
 * Extends {@link McpServerOptions} with an optional mount `path`
 * (defaults to `/mcp`).
 */
export type McpMountOptions = McpServerOptions & {
  /** Path to mount the MCP endpoint on. Defaults to `/mcp`. */
  path?: string;
};

/**
 * Top-level HTTP server. Aggregates {@link Router}s, OpenAPI documentation,
 * middlewares, health checks, and MCP tool routers, then exposes a universal
 * {@link Server.fetch} handler to be bound to a runtime adapter.
 *
 * @example
 * ```ts
 * import { Server, swaggerUI, useLogger } from "@serverx/server";
 * import { serve } from "@serverx/server/deno";
 *
 * const app = new Server();
 * app.addMiddleware(useLogger());
 * app.addRouter(userRouter);
 * app.addOpenApi({
 *   url: "/api-docs",
 *   openapi: "3.0.0",
 *   info: { title: "User API", version: "1.0.0" },
 * });
 * app.addOpenApiUi("/swagger", swaggerUI());
 *
 * serve(app, { port: 3100 });
 * ```
 */
export class Server {
  #router = new Hono();
  #apiDocs: OpenApi = new OpenApi();
  #mcpRouters: McpRouter[] = [];

  /**
   * Mount a {@link Router} at the root path and merge its OpenAPI metadata
   * into the server's aggregated documentation.
   */
  addRouter(router: Router) {
    this.#router.route("/", router.nativeRouter);
    const docs = router.nativeApiDocs;
    this.#apiDocs.addSubOpenApi({
      route: "/",
      openApi: docs,
    });
  }

  /**
   * Serve the aggregated OpenAPI JSON document. Mounts at `config.url`
   * (defaults to `/api-docs`).
   */
  addOpenApi(config: OpenApiUiOption) {
    this.#router.get(config.url ?? "/api-docs", (c) => {
      return c.json(this.#apiDocs.getOpenApiJsonDoc(config));
    });
  }

  /**
   * Mount an OpenAPI UI (e.g. Swagger or Scalar) at `path`, rendered by the
   * provided handler.
   */
  addOpenApiUi(path: string, fn: (c: Context) => Response) {
    this.#router.get(path, fn);
  }

  /** Register a global middleware applied to every request. */
  addMiddleware(
    fn: (context: Context, next: Next) => Promise<void | Response>,
  ) {
    this.#router.use(fn);
  }

  /**
   * Register a health check {@link Action} as a route on the server.
   *
   * @example
   * ```ts
   * app.addHealthCheck({
   *   path: "/health",
   *   method: "GET",
   *   tags: ["health"],
   *   description: "Service health",
   *   responses: healthCheckResponse(),
   *   handler: () => healthCheckHandler({
   *     dependencies: [{ name: "db", check: () => db.ping() }],
   *   }),
   * });
   * ```
   */
  addHealthCheck<T extends HealthCheckResponse>(action: Action<T>) {
    const health = new Router();
    health.addAction(action);
    this.addRouter(health);
  }

  /**
   * Register an {@link McpRouter} whose tools are exposed once the MCP
   * transport is mounted with {@link Server.addMcp}.
   */
  addMcpRouter(router: McpRouter) {
    this.#mcpRouters.push(router);
  }

  /**
   * Mount the MCP (Streamable HTTP, stateless) transport, exposing every tool
   * from the routers registered via {@link Server.addMcpRouter}.
   *
   * Call this after every {@link McpRouter} has been added — the tool list is
   * captured when a request arrives, so routers registered later are picked up,
   * but the mount path is fixed here.
   *
   * @example
   * ```ts
   * app.addMcpRouter(userMcpRouter);
   * app.addMcp({ name: "user-api", version: "1.0.0" }); // mounted at /mcp
   * ```
   */
  addMcp(options: McpMountOptions) {
    const path = options.path ?? "/mcp";
    const handler = createMcpHandler(this.#mcpRouters, {
      name: options.name,
      version: options.version,
    });
    this.#router.all(path, handler);
  }

  /**
   * The universal `fetch` handler for this server. Pass it to a
   * runtime-specific adapter — `serve` from `@serverx/server/deno` or
   * `serve` from `@serverx/server/node`.
   */
  get fetch(): Hono["fetch"] {
    return this.#router.fetch;
  }
}
