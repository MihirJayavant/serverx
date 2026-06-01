# Getting Started

## Prerequisites

- [Deno](https://deno.com) v2.0 or later

## Installation

Install both packages into your project:

```bash
deno add jsr:@serverx/server jsr:@serverx/utils
```

Or install individually:

```bash
deno add jsr:@serverx/server
deno add jsr:@serverx/utils
```

---

## Your First Server

Create `main.ts`:

```ts
import { cors, Router, Server, swaggerUI, useLogger } from "@serverx/server";
import {
  errorResult,
  httpMethods,
  openApiParameter,
  openApiResponse,
  statusCodes,
  successResult,
} from "@serverx/utils";

// In-memory store for this example
const users: Record<string, { id: string; name: string }> = {
  "1": { id: "1", name: "Alice" },
};

// Define a router
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
    schema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id", "name"],
    },
  }),
  handler: ({ params }) => {
    const user = users[params.id];
    return user
      ? successResult(user)
      : errorResult("User not found", statusCodes.NotFound);
  },
});

// Build the server
const app = new Server();
app.addMiddleware(useLogger({ level: "info" }));
app.addMiddleware(cors());
app.addRouter(router);
app.addOpenApi({
  url: "/api-docs",
  openapi: "3.1.0",
  info: { version: "1.0.0", title: "My API" },
});
app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.serve({ port: 3100, hostname: "127.0.0.1" });
```

Run it:

```bash
deno run --allow-net=127.0.0.1:3100 main.ts
```

Visit:

- `http://127.0.0.1:3100/users/1` — JSON response
- `http://127.0.0.1:3100/swagger-docs` — Swagger UI
- `http://127.0.0.1:3100/api-docs` — Raw OpenAPI JSON

---

## Running the Example App

The repository includes a full CRUD user API in
[`example/`](https://github.com/MihirJayavant/serverx/tree/main/example).

```bash
# Clone the repo
git clone https://github.com/MihirJayavant/serverx.git
cd serverx

# Start the API on port 3100 (watch mode)
deno task user-api

# In a second terminal — run integration tests
deno task test:api

# Inspect MCP tools interactively
deno task mcp-inspect
```

---

## Next Steps

- [[Router-and-Actions]] — learn the Action pattern
- [[Base-Handler]] — add Zod validation to handlers
- [[MCP]] — expose your API as MCP tools
- [[Example-App]] — full CRUD walkthrough
