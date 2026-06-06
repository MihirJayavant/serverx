# @serverx/utils

[![JSR](https://jsr.io/badges/@serverx/utils)](https://jsr.io/@serverx/utils)

A collection of utility functions, types, and helpers for building APIs with
[ServerX](https://github.com/MihirJayavant/serverx).

## Features

- **Result types** — discriminated union for success/error responses with HTTP
  status helpers
- **HTTP client** — typed fetch wrapper with built-in retry and circuit breaker
- **Pagination** — offset and cursor-based pagination helpers
- **OpenAPI** — builders for parameters, request bodies, responses, and UI
  (Swagger / Scalar)
- **Logger** — lightweight logger interface with pluggable implementations
- **Utility types** — `Prettify`, `StrictOmit`, `OptionalExcept`, and more

## Installation

```bash
deno add jsr:@serverx/utils
```

## Result Types

All handlers should return a `Result<T>` — a discriminated union of
`SuccessResult<T>` and `ErrorResult`. Use the helper constructors rather than
building the objects by hand.

```ts
import {
  errorResult,
  internalServerError,
  isError,
  isSuccess,
  statusCodes,
  successResult,
} from "@serverx/utils";

// 200 OK
successResult(user);

// 201 Created
successResult(user, statusCodes.Created);

// 204 No Content
successResult(null, statusCodes.NoContent);

// 404 Not Found
errorResult("User not found", statusCodes.NotFound);

// 500 Internal Server Error
internalServerError();

// Type guards
if (isSuccess(result)) {
  console.log(result.data);
}

if (isError(result)) {
  console.log(result.error);
}
```

### Status codes

```ts
import { statusCodes } from "@serverx/utils";

statusCodes.Ok; // 200
statusCodes.Created; // 201
statusCodes.NoContent; // 204
statusCodes.BadRequest; // 400
statusCodes.Unauthorized; // 401
statusCodes.Forbidden; // 403
statusCodes.NotFound; // 404
statusCodes.Conflict; // 409
statusCodes.InternalServerError; // 500
```

## HTTP Methods

```ts
import { httpMethods } from "@serverx/utils";

httpMethods.GET; // "GET"
httpMethods.POST; // "POST"
httpMethods.PUT; // "PUT"
httpMethods.PATCH; // "PATCH"
httpMethods.DELETE; // "DELETE"
```

## HTTP Client

A typed fetch wrapper with retry and circuit breaker support built in.

```ts
import { HttpClient } from "@serverx/utils";

const client = new HttpClient({
  baseUrl: "https://api.example.com",
  headers: { Authorization: "Bearer token" },
  retryOptions: {
    maxRetries: 3,
    delayMs: 300,
    useExponentialBackoff: true,
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 10_000,
  },
});

const user = await client.get<User>("/users/1");
const created = await client.post<User, CreateUserDto>("/users", {
  name: "Alice",
});
await client.delete("/users/1");
```

### Retry

Use `withRetry` directly for one-off calls.

```ts
import { withRetry } from "@serverx/utils";

const result = await withRetry(() => fetch("https://api.example.com/data"), {
  maxRetries: 3,
  delayMs: 500,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.status >= 500,
});
```

### Circuit Breaker

```ts
import { CircuitBreaker, CircuitState } from "@serverx/utils";

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 10_000,
  successThreshold: 2,
});

const result = await breaker.execute(() => callExternalService());

// Inspect state
breaker.getState(); // CircuitState.CLOSED | OPEN | HALF_OPEN
```

## Pagination

### Offset pagination

```ts
import { offsetPaginate, type OffsetPaginationParams } from "@serverx/utils";

async function listUsers(params: OffsetPaginationParams) {
  const { page = 1, pageSize = 20 } = params;
  const [data, totalItems] = await Promise.all([
    db.users.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
    db.users.count(),
  ]);

  return successResult(offsetPaginate({ data, totalItems, page, pageSize }));
}
```

`offsetPaginate` returns:

```ts
{
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
```

### Cursor pagination

```ts
import {
  type CursorPaginatedResult,
  type CursorPaginationParams,
} from "@serverx/utils";

async function listPosts(
  params: CursorPaginationParams,
): Promise<CursorPaginatedResult<Post>> {
  const { after, limit } = params;
  const data = await db.posts.findMany({ cursor: after, take: limit + 1 });
  const hasNextPage = data.length > limit;

  return {
    data: data.slice(0, limit),
    limit,
    hasNextPage,
    hasPreviousPage: !!after,
  };
}
```

### Selector helper

Convert an array of field names into a database-compatible select map.

```ts
import { convertSelector } from "@serverx/utils";

convertSelector(["id", "name", "email"]);
// => { id: 1, name: 1, email: 1 }
```

## OpenAPI Helpers

### Parameters

```ts
import { openApiParameter } from "@serverx/utils";

export const parameters = openApiParameter({
  name: "userId",
  in: "path",
  description: "ID of the user",
  required: true,
  schema: { type: "string" },
});
```

### Responses

```ts
import { openApiResponse } from "@serverx/utils";

export const responses = openApiResponse({
  status: 200,
  description: "User object",
  schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
    },
    required: ["id", "name"],
  },
});
```

### Request body

```ts
import { openApiRequestBody } from "@serverx/utils";

export const requestBody = openApiRequestBody({
  description: "User payload",
  required: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
    },
    required: ["name", "email"],
  },
});
```

### UI — Swagger and Scalar

```ts
import { scalarUIGen, swaggerUIGen } from "@serverx/utils";

// Swagger UI HTML
const html = swaggerUIGen({ url: "/api-docs" });

// Scalar UI HTML (with optional theme)
const html = scalarUIGen({ spec: { url: "/api-docs" }, theme: "deepSpace" });
```

Available Scalar themes: `alternate`, `default`, `moon`, `purple`, `solarized`,
`bluePlanet`, `deepSpace`, `saturn`, `kepler`, `mars`, `none`.

## Logger

`Logger` is an interface — wire in any compatible implementation (e.g.
`PinoLogger` from `@serverx/server`).

```ts
import type { Logger, LoggerConfig } from "@serverx/utils";

function setup(logger: Logger) {
  logger.info("server started", { fields: { port: 3100 } });
  logger.warn("high memory usage");
  logger.error("unhandled exception", { args: [err] });
  logger.debug("request received", { fields: { path: "/users" } });
}
```

## Utility Types

```ts
import type {
  JsonType,
  OptionalExcept,
  Prettify,
  StrictOmit,
  Task,
} from "@serverx/utils";

// Make complex intersected types readable in IDE hover
type Clean = Prettify<A & B>;

// Omit without widening
type NoId = StrictOmit<User, "id">;

// Make all fields optional except the listed ones
type PatchUser = OptionalExcept<User, "id">;

// Sync or async value
type MaybeAsync = Task<string>; // string | Promise<string>

// JSON-safe value
const payload: JsonType = { count: 1, active: true, tags: ["a"] };
```

## Documentation

Full docs and guides are available in the
[ServerX Wiki](https://github.com/MihirJayavant/serverx/wiki).

## License

MIT
