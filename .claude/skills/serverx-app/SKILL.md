---
name: serverx-app
description: Vertical Slice Architecture conventions for the example API in example/ — how a slice is laid out (domain schema, repository, handlers, actions, MCP tools, router aggregators, app.ts registration), the per-layer file naming rules, and how HTTP and MCP share one handler. Use when adding or changing a feature, endpoint, or MCP tool in example/, when writing an integration spec against the running server, or when following the patterns of the existing user slice.
---

# Example app — Vertical Slice Architecture

`example/` is a full CRUD API built on `@serverx/server` and `@serverx/utils`.
The `user` slice is the reference implementation; mirror it rather than
inventing a new shape.

For the library APIs themselves, use the `serverx-server` and `serverx-utils`
skills. For a narrative walkthrough, read `wiki/Example-App.md`.

## Anatomy of a slice

**Domain — `example/<feature>/`**

| File                      | Contents                                                                   | Reference                           |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| `<feature>.ts`            | Zod `strictObject` schema, `z.infer` type, `SchemaProperty` OpenAPI schema | `example/user/user.ts`              |
| `<feature>.repository.ts` | Data access — a class with a single exported instance                      | `example/user/user.repository.ts`   |
| `*-<feature>.handler.ts`  | Business logic via `baseHandler`, returning `Result<T>`                    | `example/user/get-users.handler.ts` |

**Controllers — `example/controllers/<feature>/`**

One `*.action.ts` (HTTP) and one `*.mcp.ts` (MCP tool) per endpoint, both
importing the **same** handler.

| File          | Exports                                                                                             | Reference                                     |
| ------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `*.action.ts` | `path`, `method`, `handler`, plus `tags`, `description`, `parameters` / `requestBody` / `responses` | `example/controllers/user/get-user.action.ts` |
| `*.mcp.ts`    | `name`, `description`, `inputSchema`, `handler`, optional `annotations`                             | `example/controllers/user/get-users.mcp.ts`   |

**Aggregation & registration**

- `example/controllers/<feature>.ts` — `new Router({ basePath: "/<feature>" })`,
  one `addAction(...)` per action (`example/controllers/user.ts`).
- `example/controllers/<feature>-mcp.ts` — `new McpRouter()`, one `addTool(...)`
  per tool (`example/controllers/user-mcp.ts`).
- `example/app.ts` — `app.addRouter(...)`, `app.addMcpRouter(...)`, and the
  single `app.addMcp({ path, name, version })` that mounts every registered tool
  (`example/app.ts:16-19`).

## Naming rules differ per layer

This is the easiest thing to get wrong.

- **Handlers use the semantic verb**: `get-users.handler.ts`,
  `add-user.handler.ts`, `update-user.handler.ts`, `delete-user.handler.ts`.
- **Actions use the HTTP verb**: `get-users.action.ts`, `post-user.action.ts`,
  `put-user.action.ts`, `delete-user.action.ts`. So `post-user.action.ts`
  imports `addUserHandler`, and `put-user.action.ts` imports
  `updateUserHandler`.
- **MCP tool `name` is snake_case and need not match its filename**:
  `get-users.mcp.ts` exports `name = "list_users"`
  (`example/controllers/user/get-users.mcp.ts:4`). Tool names must be unique
  across all routers.
- Exported handler consts are camelCase with a `Handler` suffix —
  `getUsersHandler`, `addUserHandler`.

## Rules that hold across every slice

1. **HTTP and MCP share one handler.** Both `*.action.ts` and `*.mcp.ts` import
   the same `*-<feature>.handler.ts`. Business logic is never duplicated — if a
   tool needs different behaviour, that is a new handler, not a copy.

2. **Actions adapt, they don't compute.** An action's job is to turn
   `ActionContext` into the handler's typed input and nothing more: await the
   body (`await body()` — see
   `example/controllers/user/post-user.action.ts:22-25`) and coerce params
   (`Number(params.userId)` — `get-user.action.ts:26`).

3. **The domain file carries all three artifacts.** Zod schema for validation,
   `z.infer` type for TypeScript, and a hand-written `SchemaProperty` for
   OpenAPI. They are separate on purpose — keep them in sync manually.

4. **List results are wrapped.** Handler output must satisfy `JsonType`, so
   return `{ data: User[] }`, never a bare array
   (`example/user/get-users.handler.ts:9-11`).

5. **Every endpoint carries OpenAPI metadata** — `tags`, `description`, and
   `parameters` / `requestBody` / `responses` as applicable. This is a project
   rule, not an optional extra.

6. **Action `path` is relative to the router's `basePath`.** The user router
   uses `basePath: "/user"`, so `get-user.action.ts` exports
   `path = "/:userId"`.

7. **New functionality means a new slice.** Add `example/<feature>/` rather than
   extending an unrelated existing folder.

## Testing

`example/controllers/*.spec.ts` are **integration** tests hitting the live
server at `127.0.0.1:3100` — `deno task user-api` must be running, then
`deno task test:api`. `user-mcp.spec.ts` drives a real MCP client over
Streamable HTTP.

Unit specs under `libs/` are the opposite: they run under bare `deno test` with
no permission flags and must never touch the network.

## Related commands

- `/new-slice <feature>` — scaffold a full CRUD slice
- `/add-endpoint` — add a single endpoint to an existing slice
- `/verify-mcp` — validate the MCP surface
- `/ci` — run every check, including the integration tests
