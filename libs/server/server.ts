import { Hono } from "@hono/hono";
import type { Context, Next } from "@hono/hono";
import { type Action, Router } from "./router/router.ts";
import { OpenApi, type OpenApiUiOption } from "@serverx/utils";
import type { HealthCheckResponse } from "./handlers/healthcheck.ts";
import type { McpRouter } from "./mcp/mcp-router.ts";
import { createMcpHandler, type McpServerOptions } from "./mcp/mcp-server.ts";

export type McpMountOptions = McpServerOptions & {
  path?: string;
};

export class Server {
  #router = new Hono();
  #apiDocs: OpenApi = new OpenApi();
  #mcpRouters: McpRouter[] = [];

  addRouter(router: Router) {
    this.#router.route("/", router.nativeRouter);
    const docs = router.nativeApiDocs;
    this.#apiDocs.addSubOpenApi({
      route: "/",
      openApi: docs,
    });
  }

  addOpenApi(config: OpenApiUiOption) {
    this.#router.get(config.url ?? "/api-docs", (c) => {
      return c.json(this.#apiDocs.getOpenApiJsonDoc(config));
    });
  }

  addOpenApiUi(path: string, fn: (c: Context) => Response) {
    this.#router.get(path, fn);
  }

  addMiddleware(
    fn: (context: Context, next: Next) => Promise<void | Response>,
  ) {
    this.#router.use(fn);
  }

  addHealthCheck<T extends HealthCheckResponse>(action: Action<T>) {
    const health = new Router();
    health.addAction(action);
    this.addRouter(health);
  }

  addMcpRouter(router: McpRouter) {
    this.#mcpRouters.push(router);
  }

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
