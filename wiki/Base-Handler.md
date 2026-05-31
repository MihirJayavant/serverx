# Base Handler

`baseHandler` wraps your business logic with Zod input validation. If the schema fails, it returns a `400 Bad Request` automatically — the inner handler is never called.

```ts
import { baseHandler } from "@serverx/server";
```

---

## Signature

```ts
baseHandler<Input, Output extends JsonType>(option: {
  handler: (input: Input) => Task<Result<Output>>;
  validationSchema?: ZodObject | ZodAny;
}): (input: Input) => Task<Result<Output>>
```

---

## Basic Usage

```ts
import { baseHandler } from "@serverx/server";
import { errorResult, statusCodes, successResult } from "@serverx/utils";
import { z } from "zod/v4";

const getUser = baseHandler({
  validationSchema: z.object({ id: z.string().uuid() }),
  handler: async ({ id }) => {
    const user = await db.users.findById(id);
    return user
      ? successResult(user)
      : errorResult("User not found", statusCodes.NotFound);
  },
});
```

The returned function has the same signature as the inner handler. Wire it into an action:

```ts
router.addAction({
  path: "/:id",
  method: httpMethods.GET,
  // ... OpenAPI metadata ...
  handler: ({ params }) => getUser(params),
});
```

---

## Validation Errors

When schema validation fails, `baseHandler` returns:

```ts
{
  status: 400,
  error: <ZodError issues array>
}
```

You do not need to handle this case in your inner handler.

---

## Without a Schema

`validationSchema` is optional. Omitting it is useful when input is already typed and validated upstream:

```ts
const deleteUser = baseHandler({
  handler: async ({ id }: { id: string }) => {
    await db.users.delete(id);
    return successResult(null, statusCodes.NoContent);
  },
});
```

---

## Sharing Handlers Between HTTP and MCP

`baseHandler` returns a plain function, so it can be imported by both an action and an MCP tool:

```ts
// get-user.handler.ts
export const getUserHandler = baseHandler({
  validationSchema: z.object({ id: z.string().uuid() }),
  handler: async ({ id }) => {
    const user = await db.users.findById(id);
    return user ? successResult(user) : errorResult("Not found", statusCodes.NotFound);
  },
});
```

```ts
// get-user.action.ts  (HTTP)
import { getUserHandler } from "./get-user.handler.ts";
export const handler = ({ params }: ActionContext) => getUserHandler(params);
```

```ts
// get-user.mcp.ts  (MCP)
import { getUserHandler } from "./get-user.handler.ts";
export const handler = ({ id }: { id: string }) => getUserHandler({ id });
```

This ensures HTTP and MCP behaviour cannot diverge.

---

## Related

- [[Router-and-Actions]] — wiring handlers into actions
- [[MCP]] — sharing handlers with MCP tools
- [[Result-Types]] — what handlers return
