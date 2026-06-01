# Result Types

All handlers in ServerX return a `Result<T>` — a discriminated union of
`SuccessResult<T>` and `ErrorResult`. The router serializes it into an HTTP
response automatically; you never construct a `Response` object directly.

```ts
import {
  errorResult,
  internalServerError,
  isError,
  isSuccess,
  Result,
  statusCodes,
  successResult,
} from "@serverx/utils";
```

---

## Result&lt;T&gt;

```ts
type Result<T extends JsonType> = SuccessResult<T> | ErrorResult;
```

### SuccessResult&lt;T&gt;

A success result is either contentful (200/201/202 with a body) or
non-contentful (204/3xx with `null`).

```ts
type ContentfulSuccessResult<T> = { status: 200 | 201 | 202; data: T };
type NonContentfulSuccessResult = { status: 204 | 301 | 302 | 304; data: null };
type SuccessResult<T> = ContentfulSuccessResult<T> | NonContentfulSuccessResult;
```

### ErrorResult

```ts
type ErrorResult = {
  status: 400 | 401 | 403 | 404 | 409 | 500 | 501 | 502 | 503 | 504;
  error: unknown;
};
```

---

## Helper Functions

### `successResult(data, status?)`

Create a success result. Defaults to `200`.

```ts
successResult(user); // 200 with body
successResult(user, statusCodes.Created); // 201 with body
successResult(null, statusCodes.NoContent); // 204 no body
successResult(null, statusCodes.Found); // 302 redirect
```

When `status` is `204` or a redirect code, `data` is always stored as `null`
regardless of what you pass.

---

### `errorResult(error, status)`

Create an error result with a specific status code.

```ts
errorResult("User not found", statusCodes.NotFound); // 404
errorResult({ message: "Email taken" }, statusCodes.Conflict); // 409
errorResult(zodError.issues, statusCodes.BadRequest); // 400
```

---

### `internalServerError(error)`

Shorthand for a `500` error — use in `catch` blocks.

```ts
try {
  return successResult(await db.getUser(id));
} catch (e) {
  return internalServerError(e);
}
```

---

### `isSuccess(result)` / `isError(result)`

Type guards for narrowing a `Result<T>`:

```ts
if (isSuccess(result)) {
  console.log(result.data); // T is accessible
}

if (isError(result)) {
  console.log(result.error); // error is accessible
}
```

---

## Status Codes

`statusCodes` is a const object mapping readable names to numeric values.

| Name                  | Value |
| --------------------- | ----- |
| `Ok`                  | 200   |
| `Created`             | 201   |
| `Accepted`            | 202   |
| `NoContent`           | 204   |
| `MovedPermanently`    | 301   |
| `Found`               | 302   |
| `NotModified`         | 304   |
| `BadRequest`          | 400   |
| `Unauthorized`        | 401   |
| `Forbidden`           | 403   |
| `NotFound`            | 404   |
| `Conflict`            | 409   |
| `InternalServerError` | 500   |
| `NotImplemented`      | 501   |
| `BadGateway`          | 502   |
| `ServiceUnavailable`  | 503   |
| `GatewayTimeout`      | 504   |

---

## Typical Handler Pattern

```ts
import { baseHandler } from "@serverx/server";
import { errorResult, statusCodes, successResult } from "@serverx/utils";
import { z } from "zod/v4";

export const getUserHandler = baseHandler({
  validationSchema: z.object({ id: z.string().uuid() }),
  handler: async ({ id }) => {
    const user = await db.users.findById(id);

    if (!user) {
      return errorResult("User not found", statusCodes.NotFound);
    }

    return successResult(user);
  },
});
```

---

## Related

- [[Base-Handler]] — Zod-validated handler wrapper
- [[Router-and-Actions]] — how the router serializes Result into HTTP responses
