# Server

`Server` is the top-level class that wraps [Hono](https://hono.dev) and
orchestrates routers, middleware, OpenAPI, health checks, and MCP.

```ts
import { Server } from "@serverx/server";

const app = new Server();
```

---

## Methods

### `addMiddleware(fn)`

Register a Hono-compatible middleware. Middleware is applied globally in
registration order.

```ts
import { cors, useLogger } from "@serverx/server";

app.addMiddleware(useLogger({ level: "info" }));
app.addMiddleware(cors());
```

See [[Middleware]] for built-in options.

---

### `addRouter(router)`

Mount a [[Router-and-Actions|Router]] and register its actions and OpenAPI
metadata.

```ts
import { Router } from "@serverx/server";

const userRouter = new Router({ basePath: "/users" });
// ... add actions ...

app.addRouter(userRouter);
```

---

### `addHealthCheck(action)`

Register a health check action at `GET /healthcheck`. The action follows the
same shape as any other action.

```ts
import { healthCheckHandler, healthCheckResponse } from "@serverx/server";
import { httpMethods } from "@serverx/utils";

app.addHealthCheck({
  path: "/healthcheck",
  method: httpMethods.GET,
  tags: ["system"],
  description: "Health check",
  responses: healthCheckResponse(),
  handler: () => healthCheckHandler(),
});
```

See [[Health-Check]] for full details.

---

### `addOpenApi(config)`

Serve the OpenAPI JSON spec at the given URL.

```ts
app.addOpenApi({
  url: "/api-docs",
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});
```

---

### `addOpenApiUi(path, handler)`

Mount a documentation UI at the given path. Works with both `swaggerUI` and
`scalarUI`.

```ts
import { scalarUI, swaggerUI } from "@serverx/server";

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi(
  "/scalar-docs",
  scalarUI({ spec: { url: "/api-docs" }, theme: "deepSpace" }),
);
```

---

### `addMcpRouter(router)`

Register an [[MCP|McpRouter]] whose tools will be exposed via the MCP endpoint.

```ts
import { McpRouter } from "@serverx/server";

const mcpRouter = new McpRouter();
// ... add tools ...

app.addMcpRouter(mcpRouter);
```

---

### `addMcp(options)`

Mount the MCP Streamable HTTP endpoint. Must be called after all `addMcpRouter`
calls.

```ts
app.addMcp({
  path: "/mcp", // default: "/mcp"
  name: "my-api",
  version: "1.0.0",
});
```

| Option    | Type     | Required | Description                            |
| --------- | -------- | -------- | -------------------------------------- |
| `name`    | `string` | Yes      | Server name reported to MCP clients    |
| `version` | `string` | Yes      | Server version reported to MCP clients |
| `path`    | `string` | No       | Mount path, defaults to `"/mcp"`       |

---

### `serve(options)`

Start the HTTP server. Accepts any `Deno.ServeTcpOptions` or TLS options.

```ts
// Plain HTTP
app.serve({ port: 3100, hostname: "127.0.0.1" });

// HTTPS
app.serve({
  port: 443,
  hostname: "0.0.0.0",
  cert: Deno.readTextFileSync("cert.pem"),
  key: Deno.readTextFileSync("key.pem"),
});
```

---

## Typical Full Setup

```ts
import {
  cors,
  healthCheckHandler,
  healthCheckResponse,
  McpRouter,
  Router,
  scalarUI,
  Server,
  swaggerUI,
  useLogger,
} from "@serverx/server";
import { httpMethods } from "@serverx/utils";

const app = new Server();

app.addMiddleware(useLogger({ level: "info" }));
app.addMiddleware(cors());

app.addRouter(userRouter);

app.addHealthCheck({
  path: "/healthcheck",
  method: httpMethods.GET,
  tags: ["system"],
  description: "Health check",
  responses: healthCheckResponse(),
  handler: () => healthCheckHandler(),
});

app.addOpenApi({
  url: "/api-docs",
  openapi: "3.1.0",
  info: { version: "1.0.0", title: "My API" },
});
app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" } }));

app.addMcpRouter(mcpRouter);
app.addMcp({ path: "/mcp", name: "my-api", version: "1.0.0" });

app.serve({ port: 3100, hostname: "127.0.0.1" });
```

---

## Related

- [[Router-and-Actions]]
- [[Middleware]]
- [[Health-Check]]
- [[MCP]]
