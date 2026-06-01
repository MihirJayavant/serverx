# CLAUDE.md

## File map

| Path                              | Contents                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| `example/app.ts`                  | Server bootstrap (routers, middlewares, MCP, OpenAPI)                 |
| `example/user/`                   | Domain: `user.ts` (schema), `user.repository.ts`, `*-user.handler.ts` |
| `example/controllers/user/`       | One `*.action.ts` + `*.mcp.ts` per endpoint                           |
| `example/controllers/user.ts`     | HTTP `Router` aggregating all user actions                            |
| `example/controllers/user-mcp.ts` | `McpRouter` aggregating all user MCP tools                            |
| `libs/server/router/router.ts`    | `Router`, `addAction`, `actionHandler`                                |
| `libs/server/mcp/mcp-router.ts`   | `McpRouter`                                                           |
| `libs/server/server.ts`           | `Server` class                                                        |
| `libs/utils/result/result.ts`     | `Result<T>`, `successResult`, `errorResult`, `isSuccess`              |
| `libs/utils/open-api/helpers.ts`  | `openApiParameter`, `openApiResponse`                                 |

## Commands

```bash
# Run the example API (watch mode, port 3100)
deno task user-api

# Run integration tests (requires the server to be running)
deno task test:api

# Generate HTML docs for @serverx/utils
deno task util-docs

# Launch MCP Inspector against the running server
deno task mcp-inspect        # interactive UI (port 6274)
deno task mcp-inspect:list   # one-shot tools/list to stdout

# CI checks (run all before pushing)
deno fmt --check
deno lint
deno check
deno test

# Run a single test file
deno test libs/utils/result/result.spec.ts
```

## Architecture

Deno monorepo (`deno.json` workspace) with two publishable libraries and an
example app:

- `libs/server/` — `@serverx/server`: HTTP server, router, middlewares,
  healthcheck (built on Hono)
- `libs/utils/` — `@serverx/utils`: Result types, pagination, OpenAPI builders,
  HTTP client with retry/circuit-breaker, Logger interface
- `example/` — Full CRUD user API demonstrating **Vertical Slice Architecture
  (VSA)**

### Action pattern (`@serverx/server`)

An _Action_ is a plain TypeScript module whose named exports define a route.
`Router.addAction()` wires both the HTTP handler and OpenAPI metadata.

Required exports:

```ts
export const path = "/:userId";
export const method = httpMethods.GET;
export function handler({ params, body, query, context }: ActionContext) { ... }
```

Optional OpenAPI exports: `tags`, `description`, `parameters`, `responses`.

### Business logic layer (`baseHandler`)

Handlers in `example/user/*.handler.ts` apply Zod validation then return
`Result<T>`:

```ts
export const getUser = baseHandler({
  handler: (input: Input) => {/* returns Result<T> */},
  validationSchema: z.object({ id: z.number() }),
});
```

Actions in `example/controllers/user/` adapt `ActionContext` into the handler's
typed input.

### Result type (`@serverx/utils`)

All handlers return `Result<T>`. Use the constructors — never construct raw
objects:

```ts
successResult(data); // 200
successResult(data, statusCodes.Created); // 201
successResult(null, statusCodes.NoContent); // 204
errorResult("User not found", statusCodes.NotFound);
```

### MCP tool actions

Each `*.action.ts` has a sibling `*.mcp.ts` that imports the same
`*.handler.ts`. Required exports:

```ts
export const name = "get_user"; // snake_case
export const description = "...";
export const inputSchema = { // raw shape, NOT z.object()
  userId: z.number().int().min(1),
};
export const annotations = { readOnlyHint: true }; // optional
export function handler(input: { userId: number }) {
  return getUserHandler({ id: input.userId });
}
```

Aggregate tools in `example/controllers/<feature>-mcp.ts` with `McpRouter`,
register via `app.addMcpRouter(...)`. MCP transport is mounted with
`app.addMcp({ path: "/mcp", name, version })` — Streamable HTTP, stateless.

### Logger

`libs/utils/logger.ts` defines the `Logger` interface;
`libs/server/logger/pino-logger.ts` provides `PinoLogger`. The `useLogger()`
middleware wires it into Hono's request lifecycle.

### Adding a new vertical slice

1. Create `example/<feature>/` with `<feature>.ts` (Zod + OpenAPI schema),
   `<feature>.repository.ts`, and `*-<feature>.handler.ts` files.
2. Create `example/controllers/<feature>/` — one `*.action.ts` + `*.mcp.ts` per
   endpoint.
3. Aggregate into `example/controllers/<feature>.ts` (`Router`) and
   `example/controllers/<feature>-mcp.ts` (`McpRouter`).
4. Register both in `example/app.ts` via `app.addRouter(...)` and
   `app.addMcpRouter(...)`.

### Integration tests

`example/controllers/*.spec.ts` hit the live server at `127.0.0.1:3100`. Run
`deno task user-api` in a separate terminal before `deno task test:api`.

## Development guidelines

- **New functionality = new vertical slice.** Add a new folder rather than
  extending an existing one.
- **Always use `@serverx/server` and `@serverx/utils`** — do not reach for
  external HTTP frameworks or utility libraries.
- **Every API endpoint must include OpenAPI metadata** — `tags`, `description`,
  `parameters`, and `responses`.
- **HTTP and MCP must share the same handler.** Both `*.action.ts` and
  `*.mcp.ts` import the same `*.handler.ts`.
