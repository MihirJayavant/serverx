# MCP — Model Context Protocol

ServerX has first-class support for the
[Model Context Protocol](https://modelcontextprotocol.io), letting you expose
your business logic as AI-agent tools alongside the HTTP API. Both surfaces
share the same handlers so behaviour cannot diverge.

The MCP endpoint uses **Streamable HTTP** transport (stateless, JSON response
mode), compatible with any MCP client including Claude Desktop, Cursor, and the
[MCP Inspector](https://github.com/modelcontextprotocol/inspector).

---

## Concepts

| Term              | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| **McpRouter**     | A container that holds a set of tools (analogous to `Router` for HTTP) |
| **McpToolAction** | A single tool definition: name, description, input schema, handler     |
| **MCP endpoint**  | The Streamable HTTP handler mounted via `app.addMcp()`                 |

---

## Defining Tools

### 1. Create an McpRouter

```ts
import { McpRouter } from "@serverx/server";

const mcpRouter = new McpRouter();
```

### 2. Add tools with `addTool()`

```ts
import { z } from "zod/v4";

mcpRouter.addTool({
  name: "get_user", // snake_case tool ID
  description: "Fetch a single user by ID",
  inputSchema: {
    id: z.string().uuid(), // raw shape — NOT z.object()
  },
  annotations: { readOnlyHint: true },
  handler: ({ id }) => getUserHandler({ id }),
});
```

### 3. Mount on the server

```ts
app.addMcpRouter(mcpRouter);
app.addMcp({ path: "/mcp", name: "my-api", version: "1.0.0" });
```

---

## McpToolAction Fields

| Field         | Type                         | Required | Description                                        |
| ------------- | ---------------------------- | -------- | -------------------------------------------------- |
| `name`        | `string`                     | Yes      | Snake_case tool identifier shown to AI clients     |
| `description` | `string`                     | Yes      | Human-readable description of what the tool does   |
| `inputSchema` | `Record<string, ZodType>`    | Yes      | Raw Zod shape (not `z.object()`)                   |
| `handler`     | `(input) => Task<Result<T>>` | Yes      | Business logic — same function as the HTTP handler |
| `annotations` | `McpToolAnnotations`         | No       | Hints to AI clients about tool behaviour           |

---

## Tool Annotations

Annotations are optional hints that help AI clients reason about tool safety and
behaviour.

| Field             | Type      | Description                              |
| ----------------- | --------- | ---------------------------------------- |
| `title`           | `string`  | Human-readable display name              |
| `readOnlyHint`    | `boolean` | Tool does not modify state               |
| `destructiveHint` | `boolean` | Tool may delete or overwrite data        |
| `idempotentHint`  | `boolean` | Repeated calls have no additional effect |
| `openWorldHint`   | `boolean` | Tool interacts with external services    |

```ts
annotations: {
  readOnlyHint: true,       // safe to call multiple times
}

annotations: {
  destructiveHint: true,    // warn the user before calling
  idempotentHint: true,
}
```

---

## Sharing Handlers with HTTP

The key rule: **HTTP and MCP must import the same handler function**. Create a
`*.handler.ts` file and import it from both `*.action.ts` and `*.mcp.ts`.

```ts
// get-user.handler.ts
export const getUserHandler = baseHandler({
  validationSchema: z.object({ id: z.string().uuid() }),
  handler: async ({ id }) => {
    const user = await db.users.findById(id);
    return user
      ? successResult(user)
      : errorResult("Not found", statusCodes.NotFound);
  },
});
```

```ts
// get-user.action.ts  — HTTP surface
import { getUserHandler } from "./get-user.handler.ts";
export const path = "/:id";
export const method = httpMethods.GET;
export const handler = ({ params }: ActionContext) => getUserHandler(params);
```

```ts
// get-user.mcp.ts  — MCP surface
import { getUserHandler } from "./get-user.handler.ts";
export const name = "get_user";
export const description = "Fetch a user by ID";
export const inputSchema = { id: z.string().uuid() };
export const annotations = { readOnlyHint: true };
export const handler = ({ id }: { id: string }) => getUserHandler({ id });
```

---

## Aggregating Tools

Group tools for a feature in a single `*-mcp.ts` file:

```ts
// controllers/user-mcp.ts
import { McpRouter } from "@serverx/server";
import * as getUser from "./user/get-user.mcp.ts";
import * as addUser from "./user/add-user.mcp.ts";

const router = new McpRouter();
router.addTool(getUser);
router.addTool(addUser);

export { router as userMcpRouter };
```

```ts
// app.ts
app.addMcpRouter(userMcpRouter);
app.addMcp({ path: "/mcp", name: "my-api", version: "1.0.0" });
```

---

## Testing with the MCP Inspector

```bash
# Terminal 1 — start the server
deno task user-api

# Terminal 2 — launch the Inspector UI (port 6274)
deno task mcp-inspect
# 1. Open the printed URL with the session token
# 2. Transport: Streamable HTTP
# 3. Server URL: http://127.0.0.1:3100/mcp
# 4. Connect → use tools/list and tools/call

# Non-interactive (CI / scripts)
deno task mcp-inspect:list
```

---

## Related

- [[Base-Handler]] — shared handler pattern
- [[Router-and-Actions]] — HTTP counterpart
- [[Server]] — `addMcpRouter()` and `addMcp()` methods
