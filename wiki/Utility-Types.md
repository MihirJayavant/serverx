# Utility Types

`@serverx/utils` exports a small set of TypeScript utility types for common
patterns in API development.

```ts
import type {
  JsonArray,
  JsonType,
  OptionalExcept,
  Prettify,
  StrictOmit,
  Task,
} from "@serverx/utils";
```

---

## `Prettify<T>`

Flattens intersection types into a single object type, making IDE hover tooltips
and error messages much more readable.

```ts
type A = { id: string };
type B = { name: string };

type Raw = A & B;
// Hover shows: A & B

type Clean = Prettify<A & B>;
// Hover shows: { id: string; name: string }
```

Most useful when you compose types from multiple interfaces and want the
resulting type to be human-readable.

---

## `StrictOmit<T, K>`

Like TypeScript's built-in `Omit`, but does not widen the resulting type. The
remaining properties stay as strongly typed as in the original.

```ts
type User = { id: string; name: string; email: string };

type UserWithoutId = StrictOmit<User, "id">;
// { name: string; email: string }
```

Use `StrictOmit` instead of `Omit` when you need the result to remain assignable
to a strict contract.

---

## `OptionalExcept<T, K>`

Makes all properties of `T` optional **except** the ones listed in `K`.

```ts
type User = { id: string; name: string; email: string };

type PatchUser = OptionalExcept<User, "id">;
// { id: string; name?: string; email?: string }
```

Ideal for PATCH request payloads where only the identifier is required.

---

## `Task<T>`

Represents a value that may be synchronous or asynchronous. Used throughout
ServerX to allow handlers to return either `T` or `Promise<T>`.

```ts
type Task<T> = T | Promise<T>;
```

```ts
// Sync handler
const handler = (): Task<Result<User>> => successResult(user);

// Async handler
const handler = async (): Task<Result<User>> => {
  const user = await db.users.findById(id);
  return successResult(user);
};
```

---

## `JsonType` / `JsonArray`

Recursive types for values that are safe to serialize as JSON.

```ts
type JsonType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonType }
  | JsonType[];

type JsonArray = JsonType[];
```

`Result<T>` constrains `T extends JsonType`, ensuring all handler return values
are serializable.

```ts
// Valid
successResult({ id: "1", active: true, tags: ["admin"] });

// Compile error — Date is not JsonType
successResult(new Date());
```

---

## `OpenApiQueryTransform<T>`

Transforms the types of number and boolean fields in `T` to `string`, reflecting
how Hono parses query string parameters before you coerce them.

```ts
type Params = { page: number; pageSize: number; active: boolean };

type QueryParams = OpenApiQueryTransform<Params>;
// { page: string; pageSize: string; active: string }
```

Use this as the `TQuery` type parameter on `ActionContext` when your action
reads numeric or boolean query params.

---

## Related

- [[Result-Types]] — `JsonType` constraint on `Result<T>`
- [[Router-and-Actions]] — `Task<Result<T>>` as the handler return type
