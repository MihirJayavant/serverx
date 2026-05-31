# Example App

The [`example/`](https://github.com/MihirJayavant/serverx/tree/main/example) directory contains a full CRUD user API that demonstrates every major ServerX feature. It follows **Vertical Slice Architecture (VSA)** — each feature owns its schema, repository, handlers, HTTP actions, and MCP tools in a single folder.

---

## Running the App

```bash
# Terminal 1 — start the API (watch mode, port 3100)
deno task user-api

# Terminal 2 — run integration tests
deno task test:api

# Terminal 2 — inspect MCP tools interactively
deno task mcp-inspect

# CI / non-interactive MCP check
deno task mcp-inspect:list
```

Endpoints once running:

| URL | Description |
|---|---|
| `http://127.0.0.1:3100/users` | User CRUD API |
| `http://127.0.0.1:3100/healthcheck` | Health check |
| `http://127.0.0.1:3100/api-docs` | OpenAPI JSON |
| `http://127.0.0.1:3100/swagger-docs` | Swagger UI |
| `http://127.0.0.1:3100/scalar-docs` | Scalar UI |
| `http://127.0.0.1:3100/mcp` | MCP Streamable HTTP |

---

## Directory Structure

```
example/
├── app.ts                          # Server setup — registers all routers and middleware
├── healthcheck.ts                  # Health check action
│
├── user/                           # User vertical slice
│   ├── user.ts                     # Zod schema + OpenAPI schema for User
│   ├── user.repository.ts          # In-memory data store
│   ├── get-user.handler.ts
│   ├── get-users.handler.ts
│   ├── add-user.handler.ts
│   ├── update-user.handler.ts
│   └── delete-user.handler.ts
│
└── controllers/
    ├── user/                       # HTTP actions (one file per endpoint)
    │   ├── get-user.action.ts
    │   ├── get-users.action.ts
    │   ├── add-user.action.ts
    │   ├── update-user.action.ts
    │   └── delete-user.action.ts
    ├── user.ts                     # Router — aggregates HTTP actions
    ├── user-mcp.ts                 # McpRouter — aggregates MCP tools
    ├── user.spec.ts                # HTTP integration tests
    └── user-mcp.spec.ts            # MCP integration tests
```

---

## Vertical Slice Architecture

Each feature slice is self-contained:

```
user/
├── user.ts              ← schema & types
├── user.repository.ts   ← data access
└── *.handler.ts         ← business logic (used by both HTTP and MCP)
```

The controller layer adapts the framework context into the handler's typed input:

```
controllers/user/
└── get-user.action.ts   ← extracts params from ActionContext → calls handler
controllers/
└── user-mcp.ts          ← extracts input from MCP call → calls same handler
```

---

## Key Files

### `example/app.ts`

Wires everything together:

```ts
const app = new Server();

app.addMiddleware(useLogger({ level: "debug" }));
app.addMiddleware(cors());

app.addHealthCheck(healthcheck);
app.addRouter(userRouter);
app.addMcpRouter(userMcpRouter);

app.addOpenApi({ url: "/api-docs", openapi: "3.1.0", info: { version: "1.0.0", title: "ServerX Example" } });
app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" } }));
app.addMcp({ path: "/mcp", name: "serverx-example", version: "1.0.0" });

app.serve({ port: 3100, hostname: "127.0.0.1" });
```

### `example/user/get-user.handler.ts`

Business logic — shared by HTTP and MCP:

```ts
export const getUserHandler = baseHandler({
  validationSchema: z.object({ id: z.number().int().min(1) }),
  handler: ({ id }) => {
    const user = userRepository.get(id);
    return user
      ? successResult(user)
      : errorResult("User not found", statusCodes.NotFound);
  },
});
```

### `example/controllers/user/get-user.action.ts`

HTTP surface:

```ts
export const path = "/:id";
export const method = httpMethods.GET;
export const tags = ["user"];
export const description = "Get user by id";
export const parameters = openApiParameter({ name: "id", in: "path", required: true, schema: { type: "number" } });
export const responses = openApiResponse({ status: 200, description: "User", schema: userSchema });

export function handler({ params }: ActionContext) {
  return getUserHandler({ id: Number(params.id) });
}
```

### `example/controllers/user-mcp.ts`

MCP surface — same handler, different entry point:

```ts
const router = new McpRouter();

router.addTool({
  name: "get_user",
  description: "Fetch a user by ID",
  inputSchema: { userId: z.number().int().min(1) },
  annotations: { readOnlyHint: true },
  handler: ({ userId }) => getUserHandler({ id: userId }),
});

export { router as userMcpRouter };
```

---

## Integration Tests

Tests hit the live server at `127.0.0.1:3100` — start the server before running them.

```bash
# HTTP routes
deno test example/controllers/user.spec.ts --allow-net=127.0.0.1:3100

# MCP tools via SDK Client + StreamableHTTPClientTransport
deno test example/controllers/user-mcp.spec.ts --allow-net=127.0.0.1:3100

# All at once
deno task test:api
```

---

## Adding a New Vertical Slice

1. Create `example/<feature>/` with `<feature>.ts` (schema), `<feature>.repository.ts`, and `*.<feature>.handler.ts` files
2. Create `example/controllers/<feature>/` with one `*.action.ts` per endpoint and a sibling `*.mcp.ts` per tool
3. Aggregate HTTP actions in `example/controllers/<feature>.ts` (a `Router`)
4. Aggregate MCP tools in `example/controllers/<feature>-mcp.ts` (an `McpRouter`)
5. Register both in `example/app.ts`

---

## Related

- [[Router-and-Actions]] — Action pattern details
- [[MCP]] — MCP tool definitions
- [[Base-Handler]] — shared handler pattern
- [[Getting-Started]] — installation and first steps
