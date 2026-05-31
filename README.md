# ServerX

[![JSR @serverx/server](https://jsr.io/badges/@serverx/server)](https://jsr.io/@serverx/server)
[![JSR @serverx/utils](https://jsr.io/badges/@serverx/utils)](https://jsr.io/@serverx/utils)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

A Deno framework for building type-safe REST APIs with automatic OpenAPI
documentation and [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
support out of the box.

## Packages

| Package | Description |
|---|---|
| [`@serverx/server`](./libs/server) | HTTP server, router, middleware, and MCP — built on Hono |
| [`@serverx/utils`](./libs/utils) | Result types, pagination, OpenAPI builders, HTTP client |

## Quick Start

```bash
deno add jsr:@serverx/server jsr:@serverx/utils
```

```ts
import { cors, Router, Server, swaggerUI, useLogger } from "@serverx/server";
import {
  httpMethods,
  openApiParameter,
  openApiResponse,
  statusCodes,
  successResult,
} from "@serverx/utils";

const router = new Router({ basePath: "/users" });

router.addAction({
  path: "/:id",
  method: httpMethods.GET,
  tags: ["users"],
  description: "Fetch a user by ID",
  parameters: openApiParameter({
    name: "id",
    in: "path",
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

const app = new Server();
app.addMiddleware(useLogger());
app.addMiddleware(cors());
app.addRouter(router);
app.addOpenApi({ url: "/api-docs", openapi: "3.1.0", info: { version: "1.0.0", title: "My API" } });
app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.serve({ port: 3100, hostname: "127.0.0.1" });
```

## Key Concepts

### Action pattern

An _Action_ is an object (or a file's named exports) that pairs a route
definition with its OpenAPI metadata. `Router.addAction()` wires both up
automatically — no separate spec writing needed.

```ts
router.addAction({
  path: "/",
  method: httpMethods.POST,
  // OpenAPI
  tags: ["users"],
  description: "Create a user",
  requestBody: openApiRequestBody({ ... }),
  responses: openApiResponse({ ... }),
  // Handler
  handler: ({ body }) => createUser(await body()),
});
```

### Result type

All handlers return `Result<T>` — a discriminated union that maps cleanly to
HTTP responses. The router serializes it; you never touch `Response` directly.

```ts
import { errorResult, statusCodes, successResult } from "@serverx/utils";

successResult(user);                                    // 200
successResult(user, statusCodes.Created);               // 201
successResult(null, statusCodes.NoContent);             // 204
errorResult("User not found", statusCodes.NotFound);    // 404
```

### Validated handlers

`baseHandler` applies Zod validation before your logic runs and returns `400`
automatically on failure.

```ts
import { baseHandler } from "@serverx/server";
import { z } from "zod/v4";

const createUser = baseHandler({
  validationSchema: z.object({ name: z.string(), email: z.string().email() }),
  handler: async (input) => {
    const user = await db.users.create(input);
    return successResult(user, statusCodes.Created);
  },
});
```

### MCP support

Every HTTP action can have a sibling MCP tool that shares the same handler.
This keeps HTTP and AI-agent surfaces in sync without duplicating logic.

```ts
import { McpRouter } from "@serverx/server";
import { z } from "zod/v4";

const mcpRouter = new McpRouter();

mcpRouter.addTool({
  name: "get_user",
  description: "Fetch a user by ID",
  inputSchema: { id: z.string().uuid() },
  annotations: { readOnlyHint: true },
  handler: ({ id }) => getUserHandler({ id }),
});

app.addMcpRouter(mcpRouter);
app.addMcp({ path: "/mcp", name: "my-api", version: "1.0.0" });
```

## Example App

The [`example/`](./example) directory contains a full CRUD user API built with
[Vertical Slice Architecture](https://github.com/MihirJayavant/serverx/wiki),
demonstrating HTTP routes, MCP tools, OpenAPI docs, health checks, and
integration tests.

```bash
# Start the example API on port 3100
deno task user-api

# Run integration tests (server must be running)
deno task test:api

# Explore the MCP tools interactively
deno task mcp-inspect
```

## Documentation

Full documentation is available in the [ServerX Wiki](https://github.com/MihirJayavant/serverx/wiki).

- [`@serverx/server` README](./libs/server/README.md)
- [`@serverx/utils` README](./libs/utils/README.md)

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request
for significant changes. See the [pull request template](.github/pull_request_template.md)
for what to include.

## License

Apache 2.0 — see [LICENSE](LICENSE).
