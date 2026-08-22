Add a new feature to one of the published libraries: $ARGUMENTS

Arguments: `<package> <feature-name>`

- `<package>`: `server` (`@serverx/server`) or `utils` (`@serverx/utils`)
- `<feature-name>`: kebab-case, matching the file to create (e.g.
  `rate-limiter`)

This is for library code under `libs/`. To add a feature to the example API
instead, use `/new-slice` or `/add-endpoint`.

---

## Step 1 — Place the file correctly

Read `libs/<package>/mod.ts` first, then put the new file in the folder that
matches its role:

`libs/server/`

| Folder         | Contents                                               |
| -------------- | ------------------------------------------------------ |
| `middlewares/` | Hono middlewares (`cors.ts`, `logger.ts`, `scalar.ts`) |
| `handlers/`    | Built-in route handlers (`healthcheck.ts`)             |
| `router/`      | `Router`, actions, request handling                    |
| `mcp/`         | MCP router, server, types, result adapter              |
| `logger/`      | Logger implementations (`pino-logger.ts`)              |

`libs/utils/`

| Folder        | Contents                            |
| ------------- | ----------------------------------- |
| `result/`     | `Result<T>` and constructors        |
| `http/`       | HTTP client, retry, circuit breaker |
| `pagination/` | Offset/cursor pagination, filters   |
| `open-api/`   | OpenAPI builders, Swagger/Scalar UI |

Root-level files (`libs/utils/logger.ts`, `libs/server/server.ts`) are reserved
for cross-cutting interfaces and the top-level entry points.

---

## Step 2 — Write the implementation

- Depend only on what the package already imports — check the package's own
  `deno.json` `imports`. **Do not add a new external dependency without asking
  first.**
- `@serverx/utils` must stay runtime-agnostic: no Hono, no `Deno.*` APIs that
  break Node. `@serverx/server` may use `@hono/hono`.
- Runtime-specific code belongs in `libs/server/deno.ts` or
  `libs/server/node.ts`, which are separate published exports — never branch on
  the runtime inside a shared module.
- Return `Result<T>` via `successResult` / `errorResult` for anything fallible;
  never construct result objects by hand.
- Export explicit return types on all public functions (JSR requires them).

---

## Step 3 — Export it publicly

Add `export * from "./<folder>/<feature-name>.ts";` to `libs/<package>/mod.ts`.
If a symbol should stay internal, leave it out of the barrel rather than
exporting and hiding it.

---

## Step 4 — Document, test, verify

1. JSDoc every new public symbol — run `/document-api <package>` or follow the
   style in `libs/server/server.ts`.
2. Write `<feature-name>.spec.ts` beside the source — run `/unit-test` on the
   new file. Specs must run with **no permission flags**.
3. Run the checks:

   ```bash
   deno fmt --check
   deno lint
   deno check
   deno test
   deno doc --lint libs/<package>/mod.ts
   ```

---

## Step 5 — Wire it into the example app, if it is user-facing

If the feature is something an app author calls (a middleware, a handler, a
helper), demonstrate it in `example/app.ts` so it stays exercised by the
integration tests.

---

## Step 6 — Follow up

Report the new public exports and suggest `/update-wiki` to document the
feature. Do not bump the package `version` — releases are handled separately,
and `libs/server` and `libs/utils` are versioned in lockstep.
