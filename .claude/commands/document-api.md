Add or fix JSDoc on the public API of: $ARGUMENTS

Arguments: `<package>` (`server` or `utils`), optionally followed by a file or
folder to narrow the pass — e.g. `server mcp/` or `utils result/result.ts`.

Both packages are published to JSR, where every public export is rendered as
reference documentation. Undocumented exports lower the JSR score and ship as
blank pages.

---

## Step 1 — Determine the public surface

Read `libs/<package>/mod.ts` (and `deno.json` `exports` — `@serverx/server` also
publishes `./deno` and `./node`). Only symbols reachable from those entry points
are public. Internal helpers that are never re-exported do not need JSDoc.

---

## Step 2 — Document every public symbol

Match the established style — read `libs/server/server.ts` and
`libs/server/mcp/result-adapter.ts` first; they are the reference.

**Functions and classes** — one imperative sentence describing what it does,
then any non-obvious behaviour or default:

```ts
/**
 * Mount the MCP (Streamable HTTP, stateless) transport, exposing every tool
 * from the routers registered via {@link Server.addMcpRouter}.
 */
```

**Types** — a summary on the type itself, plus a one-line comment on each
member:

```ts
/** MCP `tools/call` response shape returned by a tool handler. */
export type McpToolCallResult = {
  /** Tool output rendered as text content blocks. */
  content: Array<{ type: "text"; text: string }>;
  /** Set when the result represents an error. */
  isError?: boolean;
};
```

Style rules:

- Imperative mood, third person, no "This function…" preamble — "Mount…",
  "Register…", "Adapt…", "Build a handler that…".
- Cross-reference other public symbols with `{@link Symbol}` or
  `{@link Class.method}`.
- Document defaults explicitly (e.g. "Defaults to `/mcp`.", "Mounts at
  `config.url` (defaults to `/api-docs`).").
- Wrap identifiers, paths, and literals in backticks.
- Keep it to what the code actually does — read the implementation, never infer
  behaviour from the name.
- Do not add `@param` / `@returns` tags unless a parameter's meaning is not
  obvious from its name and type; the existing files describe behaviour in prose
  instead.
- Never document non-exported internals just to raise coverage.

---

## Step 3 — Verify

```bash
deno doc --lint libs/<package>/mod.ts
deno fmt --check
deno check
```

`deno doc --lint` reports missing JSDoc, missing return types, and private types
leaking into the public API — fix everything it flags before reporting done.

For `utils`, regenerate the HTML docs afterwards:

```bash
deno task util-docs
```

---

## Step 4 — Follow up

If this pass documented a feature that is not yet in the wiki, say so and
suggest `/update-wiki <package> <feature>`. Do not edit wiki pages here.
