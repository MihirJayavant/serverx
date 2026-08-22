Verify every MCP tool is declared, registered, and exposed correctly.

Checks the `*.mcp.ts` files statically, then confirms them against the live MCP
transport. The standard `/ci` run never exercises the MCP surface — `*.mcp.ts`
files are plain modules, so a malformed tool type-checks fine and only fails at
runtime. This command closes that gap.

---

## Step 1 — Static check of every `*.mcp.ts`

Read `libs/server/mcp/types.ts` for the `McpToolAction` contract, then read
every `example/controllers/**/*.mcp.ts` and confirm each one:

- Exports `name` in **snake_case** (`get_user`, not `getUser` or `get-user`),
  unique across all routers.
- Exports a non-empty `description` — it is the only thing an MCP client sees
  when choosing the tool.
- Exports `inputSchema` as a **raw Zod shape**, i.e.
  `{ userId: z.number().int().min(1) }` — **not** wrapped in `z.object()`. This
  is the most common mistake and there is no type-level guard against it.
- Exports a `handler` that imports the **same** `*.handler.ts` as its sibling
  `*.action.ts`. Flag any tool that reimplements business logic.
- Sets `annotations` where meaningful (`readOnlyHint` for reads,
  `destructiveHint` for deletes).

---

## Step 2 — Check registration

- Every `*.mcp.ts` is registered on its `McpRouter` in
  `example/controllers/<feature>-mcp.ts` via `addTool(...)`.
- Every `McpRouter` is registered in `example/app.ts` via
  `app.addMcpRouter(...)` **and** the transport is mounted with
  `app.addMcp({ path, name, version })`.

Report any tool file that exists but is never registered — it will silently not
appear.

---

## Step 3 — Verify against the running server

```bash
# Start the server in the background
deno task user-api &
SERVER_PID=$!

# Wait until port 3100 is accepting connections (max 15s)
for i in $(seq 1 15); do
  curl -sf http://127.0.0.1:3100/healthcheck > /dev/null 2>&1 && break
  sleep 1
done

# List the tools the MCP transport actually exposes
deno task mcp-inspect:list
LIST_EXIT=$?

kill $SERVER_PID 2>/dev/null
exit $LIST_EXIT
```

Compare the returned `tools/list` output against the files found in Step 1:

- Every tool file appears in the listing, and nothing extra appears.
- Each tool's `inputSchema` renders as a JSON Schema `object` with the expected
  properties and `required` entries. A tool showing an empty or
  `{ type: "object" }`-only schema means `inputSchema` was wrapped in
  `z.object()`.

---

## Step 4 — Run the MCP integration tests

With the server still running:

```bash
deno task test:api
```

`example/controllers/user-mcp.spec.ts` exercises real `tools/call` requests.

---

## Report

List each tool with a pass/fail verdict, and for every failure show the file,
the specific rule broken, and the fix. If everything passes, state the tool
count and the mount path.
