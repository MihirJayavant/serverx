---
name: serverx-server
description: API reference and type constraints for @serverx/server (libs/server) — Server, Router, Action, ActionContext, baseHandler, McpRouter, McpToolAction, middlewares (useLogger, cors, swaggerUI, scalarUI), healthCheckHandler, PinoLogger, VirtualEntity. Use when adding or changing an HTTP route, an action, a middleware, an MCP tool, the health check, or any code under libs/server, and when wiring a Server for Deno or Node.
---

# @serverx/server

HTTP server, router, middlewares, and MCP transport, built on Hono. Every symbol
below is exported from `libs/server/mod.ts`.

For exact signatures run `deno doc libs/server/mod.ts`. For narrative docs read
the wiki page named in the routing table — that is the source of truth, so don't
restate it here.

## Exports

**Server & runtime**

| Symbol   | Purpose                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Server` | Top-level app: `addRouter`, `addMiddleware`, `addHealthCheck`, `addOpenApi`, `addOpenApiUi`, `addMcpRouter`, `addMcp`, `fetch` |
| `serve`  | Runtime binding — imported from `@serverx/server/deno` or `@serverx/server/node`, **not** from the root export                 |

**Router & actions**

| Symbol                                                            | Purpose                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `Router`                                                          | Groups actions; `addAction`, `addSubRouter`, `addMiddleware` |
| `Action<TResult>`                                                 | Route definition — handler plus OpenAPI metadata             |
| `ActionContext<TBody, TQuery, TParam>`                            | `{ body, query, params, context }`                           |
| `ActionBodyContext` / `ActionQueryContext` / `ActionParamContext` | Single-generic shorthands for `ActionContext`                |

**Business logic**

| Symbol                       | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `baseHandler`                | Wraps a handler with optional Zod validation |
| `RequestHandler<In, Out>`    | `(payload: In) => Task<Result<Out>>`         |
| `BaseHandlerOption<In, Out>` | `{ handler, validationSchema? }`             |

**Middlewares** — `useLogger(config?)`, `cors(options?)`, `swaggerUI(options)`,
`scalarUI(options)`. The two UI helpers return a handler for
`Server.addOpenApiUi`; they are not middlewares.

**Health check** — `healthCheckHandler(options)`, `healthCheckResponse()`,
`HealthCheckOptions`, `HealthCheckDependency`, `HealthCheckResponse`,
`SystemMetrics`, `SystemMetricsProvider`.

**MCP** — `McpRouter`, `McpToolAction<In, Out>`, `McpInputSchema`,
`McpToolAnnotations`, `McpToolCallResult`, `McpServerOptions`,
`McpMountOptions`, `createMcpHandler`, `resultToMcp`.

**Logging** — `PinoLogger`, implementing the `Logger` interface that lives in
`@serverx/utils`.

**Virtual entity** — `VirtualEntity<T>`, `CreatedVirtualEntity`,
`createVirtualEntity`.

## Where the details live

| Topic                     | Wiki page                    |
| ------------------------- | ---------------------------- |
| Server setup & options    | `wiki/Server.md`             |
| Deno vs Node, `serve()`   | `wiki/Runtime-Support.md`    |
| Routing, actions, context | `wiki/Router-and-Actions.md` |
| Zod-validated handlers    | `wiki/Base-Handler.md`       |
| Logger, CORS, docs UIs    | `wiki/Middleware.md`         |
| Health check endpoint     | `wiki/Health-Check.md`       |
| MCP tools & transport     | `wiki/MCP.md`                |
| Entity lifecycle hooks    | `wiki/Virtual-Entity.md`     |

## Constraints and gotchas

None of these are visible from the type names. Each cites its source — check
there if something looks off.

1. **`body` is a function, not a value.** `ActionContext.body` is
   `() => Promise<TBody>` (`libs/server/router/router.ts:32`, built at
   `router.ts:142`). Write `const payload = await body();` — destructuring
   `body` and using it as the parsed object silently yields a function.

2. **`params` and `query` are always `Record<string, string>`.** They come from
   `c.req.param()` / `c.req.query()` (`router.ts:143-144`). The generic on
   `ActionContext` is an unchecked claim, not validation — coerce explicitly:
   `Number(params.userId)`.

3. **Handler output must satisfy `JsonType`, so a bare array does not fit.**
   `Action<TResult extends JsonType>` (`router.ts:61-66`), and `JsonType` is an
   index-signature object. Wrap collections: `{ data: User[] }`.

4. **A thrown error becomes an opaque 500.** The catch-all returns
   `c.json({ error }, 500)` (`router.ts:161-163`), and an `Error` instance
   serializes to `{}`. Return `internalServerError(e)` from the handler rather
   than letting it throw.

5. **Handlers may be synchronous.** `Task<T> = T | Promise<T>` — don't add
   `async` just to satisfy the type.

6. **204 and 3xx carry no body.** They route through
   `c.newResponse(null, status)` (`router.ts:149-153`); produce them with
   `successResult(null, statusCodes.NoContent)`.

7. **`validationSchema` takes a `ZodObject`, not a raw shape.** Its type is
   `ZodObject | ZodAny`; on failure `baseHandler` returns 400 carrying
   `z.prettifyError(...)` (`libs/server/router/request-handler.ts:41-49`).
   Contrast with MCP `inputSchema` in point 10 — the two are opposites.

8. **`basePath` applies to routes and OpenAPI paths alike.**
   `new Router({ basePath: "/user" })` prefixes the Hono route
   (`router.ts:82-86`) and is passed into the OpenAPI document
   (`router.ts:116-119`), so an action's own `path` stays relative —
   `"/:userId"`, not `"/user/:userId"`.

9. **Never call `Deno.serve` directly.** `Server.fetch` is the universal handler
   (`libs/server/server.ts:101`); bind it with `serve` from
   `@serverx/server/deno` or `@serverx/server/node`. This is also what makes
   permission-free unit tests possible — drive `app.fetch(new Request(...))`.

10. **MCP `inputSchema` is a raw Zod shape.**
    `McpInputSchema = Record<string, ZodType>` (`libs/server/mcp/types.ts:22`) —
    write `{ userId: z.number() }`, never `z.object({ ... })`. Getting this
    wrong produces no type error; the tool just exposes an empty schema.

11. **`addMcpRouter` alone mounts nothing.** Tools are collected on registration
    but exposed only once `addMcp({ path, name, version })` runs
    (`libs/server/server.ts:79-94`).

## Related commands

`/add-lib-feature server <name>` to add a feature here, `/unit-test` for specs
(they must run with no permission flags), `/document-api server` for JSDoc,
`/verify-mcp` to check the MCP surface.
