# Pagination

`@serverx/utils` provides helpers for both offset-based and cursor-based pagination. Both are database-agnostic — you supply the data and counts; the helpers format the response.

```ts
import {
  convertSelector,
  offsetPaginate,
  type CursorPaginatedResult,
  type CursorPaginationParams,
  type OffsetPaginatedResult,
  type OffsetPaginationParams,
} from "@serverx/utils";
```

---

## Offset Pagination

Best for UIs that show page numbers (e.g. "Page 3 of 12").

### Types

```ts
type OffsetPaginationParams = {
  page?: number;                      // 1-based, defaults to 1
  pageSize?: number;                  // defaults to 20
  filters?: FilteringParams;
  sort?: SortingParams[];
};

type OffsetPaginatedResult<T> = {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};
```

### `offsetPaginate(input)`

Takes raw data and counts and formats the paginated result:

```ts
import { offsetPaginate, successResult } from "@serverx/utils";

handler: async ({ query }: ActionContext<unknown, OffsetPaginationParams>) => {
  const { page = 1, pageSize = 20 } = query;
  const skip = (page - 1) * pageSize;

  const [data, totalItems] = await Promise.all([
    db.users.findMany({ skip, take: pageSize }),
    db.users.count(),
  ]);

  return successResult(offsetPaginate({ data, totalItems, page, pageSize }));
},
```

Response:

```json
{
  "data": [...],
  "totalItems": 84,
  "totalPages": 5,
  "currentPage": 2,
  "pageSize": 20
}
```

### OpenAPI query parameters

`offsetPaginationParamSchema` is a pre-built OpenAPI parameter array for `page` and `pageSize`:

```ts
import { offsetPaginationParamSchema } from "@serverx/utils";

export const parameters = offsetPaginationParamSchema;
```

---

## Cursor Pagination

Best for infinite-scroll UIs or feeds where you navigate forward and backward through a stream of items.

### Types

```ts
type CursorPaginationParams = {
  after?: string;                     // cursor pointing to start of next page
  before?: string;                    // cursor pointing to start of previous page
  limit: number;
  filters?: FilteringParams;
  sort?: SortingParams[];
};

type CursorPaginatedResult<T> = {
  data: T[];
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
```

### Example

There is no `cursorPaginate()` helper because cursor logic is tightly coupled to your database's cursor format. Implement it directly:

```ts
import { type CursorPaginatedResult, type CursorPaginationParams, successResult } from "@serverx/utils";

handler: async ({ query }: ActionContext<unknown, CursorPaginationParams>) => {
  const { after, limit } = query;

  // Fetch one extra item to detect hasNextPage
  const rows = await db.posts.findMany({
    cursor: after ? { id: after } : undefined,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = rows.length > limit;

  const result: CursorPaginatedResult<Post> = {
    data: rows.slice(0, limit),
    limit,
    hasNextPage,
    hasPreviousPage: !!after,
  };

  return successResult(result);
},
```

---

## Filtering and Sorting

Both pagination param types accept optional `filters` and `sort` fields.

```ts
type FilteringParams = Record<string, string | string[]>;

type SortingParams = {
  field: string;
  order: "asc" | "desc";
  priority: number;
};
```

Pass these through to your database query directly — the helpers do not process them automatically.

---

## Selector Helper

`convertSelector` converts an array of field names into a projection map compatible with most database libraries (e.g. MongoDB, Prisma `select`).

```ts
import { convertSelector } from "@serverx/utils";

convertSelector(["id", "name", "email"]);
// => { id: 1, name: 1, email: 1 }
```

```ts
const users = await db.users.find(
  {},
  convertSelector(["id", "name"]),
);
```

---

## Related

- [[Router-and-Actions]] — wiring pagination params through ActionContext
- [[OpenAPI]] — documenting pagination parameters with `openApiParameter`
