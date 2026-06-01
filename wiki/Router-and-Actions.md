# Router and Actions

## Router

`Router` groups related actions under a common base path and optionally wraps
them with route-level middleware.

```ts
import { Router } from "@serverx/server";

const router = new Router({ basePath: "/users" });
```

| Option     | Type     | Description                                       |
| ---------- | -------- | ------------------------------------------------- |
| `basePath` | `string` | Path prefix applied to all actions in this router |

---

## Actions

An _Action_ is a plain object (or a file's named exports) that pairs a route
definition with its OpenAPI metadata. `addAction()` wires both up in one call —
no separate spec writing needed.

### Required exports

| Field     | Type                                      | Description                                    |
| --------- | ----------------------------------------- | ---------------------------------------------- |
| `path`    | `string`                                  | Hono path pattern (e.g. `"/"`, `"/:id"`)       |
| `method`  | `HttpMethod`                              | One of `httpMethods.GET/POST/PUT/PATCH/DELETE` |
| `handler` | `(ctx: ActionContext) => Task<Result<T>>` | Request handler                                |

### Optional OpenAPI exports

| Field         | Type                 | Description                  |
| ------------- | -------------------- | ---------------------------- |
| `tags`        | `string[]`           | OpenAPI tag groups           |
| `description` | `string`             | Endpoint description         |
| `parameters`  | `OpenApiParameter`   | Path/query/header parameters |
| `requestBody` | `OpenApiRequestBody` | Request body schema          |
| `responses`   | `OpenApiResponse`    | Response schemas             |

### Example

```ts
import {
  errorResult,
  httpMethods,
  openApiParameter,
  openApiRequestBody,
  openApiResponse,
  statusCodes,
  successResult,
} from "@serverx/utils";

router.addAction({
  path: "/:id",
  method: httpMethods.GET,
  tags: ["users"],
  description: "Fetch a user by ID",
  parameters: openApiParameter({
    name: "id",
    in: "path",
    description: "User ID",
    required: true,
    schema: { type: "string" },
  }),
  responses: openApiResponse({
    status: 200,
    description: "User object",
    schema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id", "name"],
    },
  }),
  handler: ({ params }) => {
    const user = db.find(params.id);
    return user
      ? successResult(user)
      : errorResult("Not found", statusCodes.NotFound);
  },
});
```

---

## ActionContext

Every handler receives an `ActionContext` with typed access to the request:

```ts
{
  body: (() => Promise<TBody>); // Parse and return the request body
  query: TQuery; // Parsed query string parameters
  params: TParam; // Path parameters
  context: Context; // Raw Hono Context (escape hatch)
}
```

### Reading the body

`body` is a function — call it to parse the JSON body:

```ts
handler: async ({ body }) => {
  const payload = await body();
  return successResult(await db.create(payload));
},
```

### Reading query parameters

```ts
handler: ({ query }) => {
  const { page = "1", pageSize = "20" } = query;
  return successResult(db.list({ page: Number(page), pageSize: Number(pageSize) }));
},
```

### Reading path parameters

```ts
handler: ({ params }) => successResult(db.find(params.id)),
```

---

## Sub-routers

Nest a router inside another to compose larger APIs:

```ts
const v1 = new Router({ basePath: "/v1" });
v1.addSubRouter(userRouter); // mounts at /v1/users/...
v1.addSubRouter(postRouter); // mounts at /v1/posts/...

app.addRouter(v1);
```

---

## Router middleware

Apply middleware only to the routes in a specific router:

```ts
router.addMiddleware(authMiddleware);
router.addAction({ ... });
```

---

## File-per-route convention

The recommended pattern is one file per action, exporting the required fields as
named exports. The action module is then imported and passed directly to
`addAction()`.

```
example/controllers/user/
  get-user.action.ts
  get-users.action.ts
  add-user.action.ts
  update-user.action.ts
  delete-user.action.ts
```

```ts
// get-user.action.ts
export const path = "/:id";
export const method = httpMethods.GET;
export const tags = ["users"];
export const description = "Fetch a user by ID";
export const parameters = openApiParameter({ ... });
export const responses = openApiResponse({ ... });
export function handler({ params }: ActionContext) {
  return getUserHandler({ id: params.id });
}
```

```ts
// user.ts (router file)
import { Router } from "@serverx/server";
import * as getUser from "./user/get-user.action.ts";
import * as addUser from "./user/add-user.action.ts";

const router = new Router({ basePath: "/users" });
router.addAction(getUser);
router.addAction(addUser);

export { router as userRouter };
```

---

## Related

- [[Base-Handler]] — add Zod validation to handler logic
- [[OpenAPI]] — OpenAPI helper functions
- [[MCP]] — expose the same handlers as MCP tools
