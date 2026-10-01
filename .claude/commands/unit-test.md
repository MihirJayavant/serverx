Write Deno unit tests for the source file or folder: $ARGUMENTS

If no argument is given, find public exports in `libs/` that have no sibling
`*.spec.ts` and test the most impactful one first.

---

## Step 1 — Read the source and an existing spec

Read the target source file in full, then read
`libs/utils/open-api/helpers.spec.ts` and `libs/utils/result/result.spec.ts` to
match the house style exactly.

---

## Step 2 — Write `<source-name>.spec.ts` beside the source

Specs are always co-located with the file they test (never a separate `tests/`
folder). Both packages already collect them via `test.include: ./**/*.spec.ts`
in their `deno.json`, so no config change is needed.

### Suite style — a `describe()` value assigned to a const

This repo does **not** use nested `describe(name, () => { ... })` callbacks. It
assigns the suite to a const and passes it as the first argument to `it()`:

```ts
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { resultToMcp } from "./result-adapter.ts";

const resultToMcpTest = describe(resultToMcp.name);

it(resultToMcpTest, "should serialize a success payload as text", () => {
  const result = resultToMcp(successResult({ id: 1 }));
  assertEquals(result.content[0].text, JSON.stringify({ id: 1 }));
});
```

Rules:

- Use `describe(fn.name)` for plain functions; use a string literal for class
  methods (`describe("OpenApi.addAction")`) or non-exported names.
- Every test name starts with `"should "`.
- Import assertions from `@std/assert`, BDD from `@std/testing/bdd`, and
  `stub`/`spy` from `@std/testing/mock`.
- Import the module under test by relative path (`./result-adapter.ts`), not via
  the package alias.

---

## Step 3 — Respect the zero-permission constraint

`.github/workflows/checks.yaml` runs bare `deno test` with **no `--allow-*`
flags**. A spec that needs a permission breaks CI. Therefore:

- **Never** call `Deno.serve`, bind a port, or hit the network in a spec.
- To test HTTP behaviour, drive the app through the universal fetch handler:

  ```ts
  const app = new Server();
  app.addRouter(router);
  const response = await app.fetch(
    new Request("http://localhost/users/1", { method: "GET" }),
  );
  assertEquals(response.status, 200);
  ```

- To test code that calls `fetch`, stub the global instead of making a real
  request, and always `restore()` it in a `finally` block — see
  `libs/utils/http/client.spec.ts`.
- Anything requiring a live server belongs in `example/controllers/*.spec.ts`
  (run via `deno task test:api`), not in `libs/`.

---

## Step 4 — Cover the real branches

For each exported function or method, test:

- The success path with a representative input.
- Every distinct error/`errorResult` branch, asserting both `status` and
  `error`.
- Boundary inputs the code explicitly handles (empty arrays, `null` payloads,
  missing optional options, defaults such as `path ?? "/mcp"`).

Assert on concrete values, not on truthiness. Do not test private fields or
re-test third-party library behaviour.

---

## Step 5 — Verify

Run the specific file first, then the full suite and formatter:

```bash
deno test libs/<package>/<path>/<name>.spec.ts
deno test
deno fmt --check
deno lint
deno check
```

Report which exports are now covered and which branches remain untested.
