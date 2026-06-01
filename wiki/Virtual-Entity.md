# Virtual Entity

`VirtualEntity` is a lifecycle abstraction for domain entities that need async
setup immediately after creation — for example, writing to a database before
returning the entity to the caller.

```ts
import { createVirtualEntity, type VirtualEntity } from "@serverx/server";
```

---

## Types

### `VirtualEntity<T>`

```ts
type VirtualEntity<T> = {
  readonly data?: T;
  onCreate: (id: number | string) => Promise<void>;
  onSave: () => Promise<void>;
};
```

| Field      | Description                                                       |
| ---------- | ----------------------------------------------------------------- |
| `data`     | Optional payload associated with the entity                       |
| `onCreate` | Called once when the entity is first created, receives the new ID |
| `onSave`   | Called on subsequent saves / updates                              |

### `CreatedVirtualEntity<TData, TEntity>`

The type returned by `createVirtualEntity` — identical to `VirtualEntity` but
without the `onCreate` method (it has already been called).

---

## `createVirtualEntity(id, entity)`

Calls `entity.onCreate(id)` and returns the entity without the `onCreate`
method. This ensures `onCreate` can only ever be called once.

```ts
const created = await createVirtualEntity("user-123", entity);
// created.onCreate is not available here
await created.onSave();
```

---

## Example

```ts
import { createVirtualEntity, type VirtualEntity } from "@serverx/server";
import { statusCodes, successResult } from "@serverx/utils";

type UserData = { name: string; email: string };

const newUser: VirtualEntity<UserData> = {
  data: { name: "Alice", email: "alice@example.com" },

  onCreate: async (id) => {
    await db.users.insert({ id, name: "Alice", email: "alice@example.com" });
  },

  onSave: async () => {
    await db.users.update({ name: "Alice", email: "alice@example.com" });
  },
};

// In a handler:
const created = await createVirtualEntity(crypto.randomUUID(), newUser);
return successResult(created.data, statusCodes.Created);
```

---

## Related

- [[Router-and-Actions]] — using entities inside action handlers
- [[Result-Types]] — returning entity data from handlers
