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

### API reference — use the skills

The API surface, type constraints, and gotchas for each area live in skills, so
they load only when relevant. Consult them before writing code:

| Working on                                                           | Skill            |
| -------------------------------------------------------------------- | ---------------- |
| `libs/server/`, routes, actions, middlewares, MCP tools              | `serverx-server` |
| `libs/utils/`, `Result<T>`, OpenAPI helpers, pagination, HTTP client | `serverx-utils`  |
| `example/` slices, handler/action/mcp conventions                    | `serverx-app`    |

Narrative docs live in `wiki/` (see `wiki/Home.md`); run
`deno doc libs/<package>/mod.ts` for exact signatures.

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
