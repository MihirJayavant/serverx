Add a single endpoint to an existing vertical slice.

Arguments: $ARGUMENTS Expected format:
`<feature> <HTTP-METHOD> <brief-description>` Example:
`user GET /search  search users by name`

Steps:

1. Read the existing slice to understand its domain types and handlers:
   - `example/<feature>/<feature>.ts`
   - `example/<feature>/<feature>.repository.ts`
   - `example/controllers/<feature>/` (existing actions for naming conventions)
   - `example/controllers/<feature>.ts` (the Router file)
   - `example/controllers/<feature>-mcp.ts` (the McpRouter file)

2. Create the handler in `example/<feature>/` if the business logic doesn't
   already exist.
   - Use `baseHandler` + Zod validation schema
   - Return `Result<T>` via `successResult` / `errorResult`

3. Create `example/controllers/<feature>/<verb>-<feature>.action.ts`:
   - Export `path`, `method`, `handler`, `tags`, `description`, `parameters`,
     `responses`
   - Import the handler from step 2

4. Create `example/controllers/<feature>/<verb>-<feature>.mcp.ts`:
   - Export `name` (snake_case), `description`, `inputSchema` (raw Zod shape),
     `handler`
   - Import the **same handler** from step 2 — never duplicate logic

5. Register both in the existing router files:
   - Add `import * as <action>` + `router.addAction(<action>)` to
     `example/controllers/<feature>.ts`
   - Add the tool to `example/controllers/<feature>-mcp.ts`

6. Run `deno check` and fix any type errors before reporting done.
