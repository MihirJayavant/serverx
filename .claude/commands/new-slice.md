Scaffold a complete CRUD vertical slice for the feature named: $ARGUMENTS

The feature name is singular lowercase (e.g. "product"). Derive plurals, PascalCase, snake_case as needed.

Follow the exact patterns from the existing `user` slice. Read these files first for reference before generating anything:
- `example/user/user.ts`
- `example/user/user.repository.ts`
- `example/user/get-user.handler.ts`
- `example/controllers/user/get-user.action.ts`
- `example/controllers/user/get-user.mcp.ts`
- `example/controllers/user.ts`
- `example/controllers/user-mcp.ts`
- `example/app.ts`

Then create all of the following files, mirroring the user slice structure:

**Domain layer** (`example/<feature>/`):
1. `<feature>.ts` — Zod `strictObject` validation schema, inferred TypeScript type, and OpenAPI schema (`SchemaProperty`)
2. `<feature>.repository.ts` — in-memory store with CRUD methods (getAll, getById, add, update, delete)
3. `get-<feature>.handler.ts`
4. `get-<feature>s.handler.ts`
5. `add-<feature>.handler.ts`
6. `update-<feature>.handler.ts`
7. `delete-<feature>.handler.ts`

**Controllers** (`example/controllers/<feature>/`):
For each of the five CRUD operations, create a paired `*.action.ts` + `*.mcp.ts`:
8. `get-<feature>.action.ts` + `get-<feature>.mcp.ts`
9. `get-<feature>s.action.ts` + `get-<feature>s.mcp.ts`
10. `post-<feature>.action.ts` + `post-<feature>.mcp.ts`
11. `put-<feature>.action.ts` + `put-<feature>.mcp.ts`
12. `delete-<feature>.action.ts` + `delete-<feature>.mcp.ts`

**Router aggregators**:
13. `example/controllers/<feature>.ts` — `Router` with `basePath: "/<feature>"`, imports all actions
14. `example/controllers/<feature>-mcp.ts` — `McpRouter`, imports all mcp tools

**Registration**:
15. Edit `example/app.ts` to import and register both `<feature>Router` and `<feature>McpRouter`

Rules:
- Every action file must export `tags`, `description`, `parameters`/`responses` for OpenAPI
- Every `.mcp.ts` must import the same handler as its sibling `.action.ts` — never duplicate logic
- Use `successResult`, `errorResult`, `statusCodes` from `@serverx/utils`
- Use `baseHandler` from `@serverx/server`
- Use `z` from `@zod/zod`
- After creating all files, run `deno check` and fix any type errors before reporting done
