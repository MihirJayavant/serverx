# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Commands

```bash
# Run the example API (watch mode, port 3100)
deno task user-api

# Run integration tests (requires the server to be running)
deno task test:api

# Generate HTML docs for @serverx/utils
deno task util-docs

# CI checks (run all before pushing)
deno fmt --check   # formatting
deno lint          # linting
deno check         # type checking
deno test          # unit tests (all *.spec.ts files)

# Run a single test file
deno test libs/utils/result/result.spec.ts
```

## Architecture

This is a **Deno monorepo** (`deno.json` workspace) with two publishable
libraries and an example app:

- `libs/server/` — `@serverx/server`: HTTP server, router, middlewares, and
  healthcheck built on **Hono**
- `libs/utils/` — `@serverx/utils`: Result types, pagination helpers, OpenAPI
  builders, HTTP client with retry/circuit-breaker, and the `Logger` interface
- `example/` — A full CRUD user API demonstrating **Vertical Slice Architecture
  (VSA)**

### The Action pattern (`@serverx/server`)

An _Action_ is a plain TypeScript module (file) whose named exports define a
route. `Router.addAction()` reads these exports to wire up both the HTTP handler
and OpenAPI metadata automatically.

Required exports per action file:

```ts
export const path = "/:userId";          // Hono path pattern
export const method = httpMethods.GET;   // from @serverx/utils
export function handler({ params, body, query, context }: ActionContext) { ... }
```

Optional exports for OpenAPI generation:

```ts
export const tags = ["user"];
export const description = "...";
export const parameters = openApiParameter(...);
export const responses = openApiResponse(...);
```

### Business logic layer (`baseHandler`)

Handlers in `example/user/*.handler.ts` use `baseHandler` from `@serverx/server`
to apply Zod validation before calling the core logic:

```ts
export const getUser = baseHandler({
  handler: (input: Input) => {/* returns Result<T> */},
  validationSchema: z.object({ id: z.number() }),
});
```

Actions in `example/controllers/user/` import these handlers and adapt
`ActionContext` into the handler's typed input.

### Result type (`@serverx/utils`)

All handlers return `Result<T>` — a discriminated union of `SuccessResult<T>`
and `ErrorResult`. Use the helper constructors; never construct raw objects:

```ts
successResult(data); // 200
successResult(data, statusCodes.Created); // 201
successResult(null, statusCodes.NoContent); // 204
errorResult("User not found", statusCodes.NotFound);
```

The router's `actionHandler` checks `isSuccess(result)` and serializes
accordingly; 204/3xx responses use `newResponse(null, status)`.

### Server setup

`Server` (from `@serverx/server`) wraps Hono and orchestrates routers,
middlewares, and OpenAPI UI:

```ts
const app = new Server();
app.addMiddleware(useLogger({ level: "debug" }));  // Pino-based
app.addMiddleware(cors());
app.addHealthCheck(healthcheck);
app.addRouter(userRouter);
app.addOpenApi({ url: "/api-docs", ... });
app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" } }));
app.serve({ port: 3100, hostname: "127.0.0.1" });
```

### Logger

`libs/utils/logger.ts` defines the `Logger` interface;
`libs/server/logger/pino-logger.ts` provides `PinoLogger` as the concrete
implementation. The `useLogger()` middleware wires `PinoLogger` into Hono's
request lifecycle.

### Adding a new vertical slice

1. Create `example/<feature>/` with `<feature>.ts` (Zod schema + OpenAPI
   schema), `<feature>.repository.ts`, and `*-<feature>.handler.ts` files.
2. Create action modules in `example/controllers/<feature>/` (one file per
   endpoint).
3. Wire actions into a new `Router` in `example/controllers/<feature>.ts`.
4. Register the router in `example/app.ts` via `app.addRouter(...)`.

### Integration tests

`example/controllers/user.spec.ts` hits the live server at `127.0.0.1:3100`. Run
`deno task user-api` in a separate terminal before executing
`deno task test:api`.

## Development guidelines

- **New functionality = new vertical slice.** Add a new folder rather than
  extending an existing one, unless the logic is directly related to that slice.
- **Always use `@serverx/server` and `@serverx/utils`** for all server-related
  logic — do not reach for external HTTP frameworks or utility libraries.
- **Every API endpoint must include OpenAPI metadata** — `tags`, `description`,
  `parameters`, and `responses` exports alongside the required `path`, `method`,
  and `handler`.
