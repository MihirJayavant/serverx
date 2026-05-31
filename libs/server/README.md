# @serverx/server

[![JSR](https://jsr.io/badges/@serverx/server)](https://jsr.io/@serverx/server)

HTTP server, router, middleware, and MCP support built on
[Hono](https://hono.dev) for building type-safe APIs.

## Features

- **Server** — Hono-based HTTP server with fluent setup API
- **Router & Actions** — file-per-route pattern with automatic OpenAPI wiring
- **Middleware** — CORS, structured request logging (Pino), Swagger UI, Scalar UI
- **Request handler** — Zod-validated handler wrapper (`baseHandler`)
- **Health check** — built-in `/healthcheck` endpoint with dependency and system metrics
- **MCP** — first-class [Model Context Protocol](https://modelcontextprotocol.io) support via Streamable HTTP
- **Virtual Entity** — lifecycle abstraction for domain entities

## Installation

```bash
deno add jsr:@serverx/server
```

## Quick Start

```ts
import { cors, Router, scalarUI, Server, swaggerUI, useLogger } from "@serverx/server";
import { openApiParameter, openApiResponse, statusCodes } from "@serverx/utils";

const router = new Router({ basePath: "/users" });

router.addAction({
  path: "/:id",
  method: httpMethods.GET,
  tags: ["users"],
  description: "Get a user by ID",
  parameters: openApiParameter({ name: "id", in: "path", required: true, schema: { type: "string" } }),
  responses: openApiResponse({ status: 200, description: "User", schema: { type: "object" } }),
  handler: ({ params }) => successResult({ id: params.id, name: "Alice" }),
});

const app = new Server();
app.addMiddleware(useLogger({ level: "info" }));
app.addMiddleware(cors());
app.addRouter(router);
app.addOpenApi({ url: "/api-docs", openapi: "3.1.0", info: { version: "1.0.0", title: "My API" } });
app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" }, theme: "deepSpace" }));
app.serve({ port: 3100, hostname: "127.0.0.1" });
```

## Server

`Server` wraps Hono and orchestrates routers, middleware, OpenAPI, and MCP.

```ts
import { Server } from "@serverx/server";

const app = new Server();

app.addMiddleware(fn);                         // Register middleware
app.addRouter(router);                         // Mount an HTTP router
app.addHealthCheck(action);                    // Register a health check action
app.addOpenApi(config);                        // Serve OpenAPI JSON spec
app.addOpenApiUi("/swagger-docs", swaggerUI()); // Mount Swagger UI
app.addOpenApiUi("/scalar-docs", scalarUI());  // Mount Scalar UI
app.addMcpRouter(mcpRouter);                   // Register MCP tool router
app.addMcp({ path: "/mcp", name: "my-api", version: "1.0.0" }); // Mount MCP endpoint
app.serve({ port: 3100, hostname: "127.0.0.1" });
```

## Router & Actions

A `Router` groups related actions. Each action is an object (typically a file's
named exports) with a `path`, `method`, `handler`, and optional OpenAPI metadata.

```ts
import { Router } from "@serverx/server";
import { httpMethods, openApiParameter, openApiResponse } from "@serverx/utils";

const router = new Router({ basePath: "/users" });

router.addAction({
  path: "/:id",
  method: httpMethods.GET,
  tags: ["users"],
  description: "Fetch a user by ID",
  parameters: openApiParameter({
    name: "id",
    in: "path",
    description: "User ID",
    required: true,
    schema: { type: "string" },
  }),
  responses: openApiResponse({
    status: 200,
    description: "User object",
    schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  }),
  handler: ({ params }) => successResult({ id: params.id }),
});
```

### ActionContext

Every handler receives an `ActionContext`:

```ts
{
  body: () => Promise<TBody>;  // Parse request body
  query: TQuery;               // Parsed query string
  params: TParam;              // Path parameters
  context: Context;            // Raw Hono context
}
```

### Sub-routers

```ts
const v1 = new Router({ basePath: "/v1" });
v1.addSubRouter(router);
```

## baseHandler

Wrap your business logic in `baseHandler` to apply Zod validation before the handler runs.

```ts
import { baseHandler } from "@serverx/server";
import { z } from "zod/v4";

const getUser = baseHandler({
  validationSchema: z.object({ id: z.string().uuid() }),
  handler: async ({ id }) => {
    const user = await db.users.findById(id);
    return user
      ? successResult(user)
      : errorResult("User not found", statusCodes.NotFound);
  },
});

// In the action:
handler: ({ params }) => getUser(params),
```

If validation fails, `baseHandler` returns a `400 Bad Request` automatically.

## Middleware

### Logger

Logs every incoming request with method, URL, headers, params, and query string.

```ts
import { useLogger } from "@serverx/server";

app.addMiddleware(useLogger({ level: "debug" }));
// level: "debug" | "info" | "warn" | "error" — defaults to "info"
```

### CORS

Re-exported from Hono — accepts the same options.

```ts
import { cors } from "@serverx/server";

app.addMiddleware(cors());
app.addMiddleware(cors({ origin: "https://example.com" }));
```

### Swagger UI

```ts
import { swaggerUI } from "@serverx/server";

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
```

### Scalar UI

```ts
import { scalarUI } from "@serverx/server";

app.addOpenApiUi("/scalar-docs", scalarUI({
  spec: { url: "/api-docs" },
  theme: "deepSpace",
}));
```

Available themes: `alternate`, `default`, `moon`, `purple`, `solarized`,
`bluePlanet`, `deepSpace`, `saturn`, `kepler`, `mars`, `none`.

## Health Check

`healthCheckHandler` reports dependency status and system metrics on `GET /healthcheck`.

```ts
import { healthCheckHandler, healthCheckResponse } from "@serverx/server";
import { httpMethods } from "@serverx/utils";

const healthcheck = {
  path: "/healthcheck",
  method: httpMethods.GET,
  tags: ["system"],
  description: "Health check",
  responses: healthCheckResponse(),
  handler: () =>
    healthCheckHandler({
      dependencies: [
        { name: "database", check: () => db.ping().then(() => true).catch(() => false) },
      ],
    }),
};

app.addHealthCheck(healthcheck);
```

Response shape:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "checks": [{ "name": "database", "healthy": true }],
  "systemMetrics": { "cpuLoad": 0.5, "freeMemory": 512, "totalMemory": 1024 }
}
```

Returns `200` when all dependencies pass, `500` if any fail.

## MCP — Model Context Protocol

Expose your business logic as MCP tools alongside the HTTP API. Both surfaces share the same handlers.

### Define tools

```ts
import { McpRouter } from "@serverx/server";
import { z } from "zod/v4";

const mcpRouter = new McpRouter();

mcpRouter.addTool({
  name: "get_user",
  description: "Fetch a single user by ID",
  inputSchema: { id: z.string().uuid() },
  annotations: { readOnlyHint: true },
  handler: ({ id }) => getUserHandler({ id }),
});
```

### Mount the MCP endpoint

```ts
app.addMcpRouter(mcpRouter);
app.addMcp({ path: "/mcp", name: "my-api", version: "1.0.0" });
```

The MCP server is mounted at `/mcp` using Streamable HTTP (stateless, JSON response mode), compatible with any MCP client.

### Tool annotations

| Field | Type | Description |
|---|---|---|
| `readOnlyHint` | `boolean` | Tool does not modify state |
| `destructiveHint` | `boolean` | Tool may delete or overwrite data |
| `idempotentHint` | `boolean` | Repeated calls have no additional effect |
| `openWorldHint` | `boolean` | Tool interacts with external services |
| `title` | `string` | Human-readable tool title |

## Logger

`PinoLogger` is the concrete `Logger` implementation used by `useLogger`.
Instantiate it directly when you need structured logging outside a request context.

```ts
import { PinoLogger } from "@serverx/server";

const logger = new PinoLogger({ level: "debug" });

logger.info("server started", { fields: { port: 3100 } });
logger.warn("slow query", { fields: { durationMs: 450 } });
logger.error("unhandled error", { args: [err] });
logger.debug("cache miss", { fields: { key: "user:1" } });
```

## Virtual Entity

`VirtualEntity` provides a lifecycle hook pattern for domain entities that need
async setup after creation (e.g. writing to a database).

```ts
import { createVirtualEntity, type VirtualEntity } from "@serverx/server";

const entity: VirtualEntity<UserData> = {
  data: { name: "Alice" },
  onCreate: async (id) => {
    await db.users.insert({ id, name: "Alice" });
  },
  onSave: async () => {
    await db.users.update({ name: "Alice" });
  },
};

// Calls onCreate(id) and returns the entity without the onCreate method
const created = await createVirtualEntity("user-123", entity);
await created.onSave();
```

## Documentation

Full docs and guides are available in the
[ServerX Wiki](https://github.com/MihirJayavant/serverx/wiki).

## License

MIT
