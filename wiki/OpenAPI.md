# OpenAPI

`@serverx/utils` provides typed builders for OpenAPI parameters, request bodies,
and responses. `@serverx/server` provides UI renderers for Swagger and Scalar.
All metadata is registered automatically when you call `addAction()` — no
separate spec writing needed.

---

## Parameters

`openApiParameter` defines path, query, or header parameters.

```ts
import { openApiParameter } from "@serverx/utils";

export const parameters = openApiParameter({
  name: "userId",
  in: "path", // "path" | "query" | "header" | "cookie"
  description: "ID of the user",
  required: true,
  schema: { type: "string", format: "uuid" },
});
```

### Multiple parameters

Pass an array to define more than one:

```ts
export const parameters = [
  openApiParameter({
    name: "userId",
    in: "path",
    required: true,
    schema: { type: "string" },
  }),
  openApiParameter({
    name: "includeDeleted",
    in: "query",
    required: false,
    schema: { type: "boolean" },
  }),
];
```

---

## Responses

`openApiResponse` defines the response for a single status code.

```ts
import { openApiResponse } from "@serverx/utils";

export const responses = openApiResponse({
  status: 200,
  description: "User object",
  schema: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
    },
    required: ["id", "name", "email"],
  },
});
```

### Multiple response codes

Pass an array:

```ts
export const responses = [
  openApiResponse({ status: 200, description: "User", schema: { type: "object", ... } }),
  openApiResponse({ status: 404, description: "User not found", schema: { type: "object", properties: { error: { type: "string" } } } }),
];
```

---

## Request Body

`openApiRequestBody` defines the JSON body accepted by POST/PUT/PATCH endpoints.

```ts
import { openApiRequestBody } from "@serverx/utils";

export const requestBody = openApiRequestBody({
  description: "Create user payload",
  required: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
    },
    required: ["name", "email"],
  },
});
```

---

## Schema Property Types

All three helpers accept a `schema` that follows the `SchemaProperty` recursive
type:

```ts
// Primitive
{ type: "string" }
{ type: "number" }
{ type: "boolean" }
{ type: "integer" }

// Object
{
  type: "object",
  properties: {
    id: { type: "string" },
    age: { type: "number" },
  },
  required: ["id"],
}

// Array
{
  type: "array",
  items: { type: "string" },
}

// Nested
{
  type: "object",
  properties: {
    address: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
    },
  },
}
```

---

## Serving the Spec

Register the OpenAPI JSON endpoint on the [[Server]]:

```ts
app.addOpenApi({
  url: "/api-docs",
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});
```

---

## Swagger UI

```ts
import { swaggerUI } from "@serverx/server";

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
```

Visit `http://127.0.0.1:3100/swagger-docs`.

---

## Scalar UI

```ts
import { scalarUI } from "@serverx/server";

app.addOpenApiUi(
  "/scalar-docs",
  scalarUI({
    spec: { url: "/api-docs" },
    theme: "deepSpace",
  }),
);
```

Visit `http://127.0.0.1:3100/scalar-docs`.

**Available themes:** `alternate`, `default`, `moon`, `purple`, `solarized`,
`bluePlanet`, `deepSpace`, `saturn`, `kepler`, `mars`, `none`

---

## Generating HTML Directly

If you need the raw HTML outside of Hono, use the lower-level generators from
`@serverx/utils`:

```ts
import { scalarUIGen, swaggerUIGen } from "@serverx/utils";

const swaggerHtml = swaggerUIGen({ url: "/api-docs" });
const scalarHtml = scalarUIGen({ spec: { url: "/api-docs" }, theme: "moon" });
```

---

## Full Action Example

```ts
import {
  httpMethods,
  openApiParameter,
  openApiRequestBody,
  openApiResponse,
} from "@serverx/utils";

router.addAction({
  path: "/",
  method: httpMethods.POST,
  tags: ["users"],
  description: "Create a new user",
  requestBody: openApiRequestBody({
    description: "User data",
    required: true,
    schema: {
      type: "object",
      properties: { name: { type: "string" }, email: { type: "string" } },
      required: ["name", "email"],
    },
  }),
  responses: [
    openApiResponse({
      status: 201,
      description: "Created user",
      schema: { type: "object" },
    }),
    openApiResponse({
      status: 400,
      description: "Validation error",
      schema: { type: "object" },
    }),
  ],
  handler: async ({ body }) => {
    const input = await body();
    return successResult(await db.users.create(input), statusCodes.Created);
  },
});
```

---

## Related

- [[Router-and-Actions]] — where OpenAPI metadata is declared
- [[Middleware]] — mounting Swagger UI and Scalar UI
- [[Server]] — `addOpenApi()` and `addOpenApiUi()` methods
