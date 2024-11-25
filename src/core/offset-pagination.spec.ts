import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { offsetPaginate } from "./offset-pagination.ts";

const offsetPaginateTest = describe(offsetPaginate.name);

it(offsetPaginateTest, "should return paginated result", () => {
  const result = offsetPaginate({
    items: [{ name: "John Doe" }],
    totalItems: 1000,
    page: 5,
    pageSize: 10,
  });
  assertEquals(result, {
    data: [{ name: "John Doe" }],
    totalItems: 1000,
    totalPages: 100,
    currentPage: 5,
    pageSize: 10,
  });
});

it(
  offsetPaginateTest,
  "should return paginated result with 1 page size for negastive page",
  () => {
    const result = offsetPaginate({
      items: [{ name: "John Doe" }],
      totalItems: 1000,
      page: -1,
      pageSize: 10,
    });
    assertEquals(result, {
      data: [{ name: "John Doe" }],
      totalItems: 1000,
      totalPages: 100,
      currentPage: 1,
      pageSize: 10,
    });
  },
);

it(
  offsetPaginateTest,
  "should return paginated result with last page size for page size greater than total pages",
  () => {
    const result = offsetPaginate({
      items: [{ name: "John Doe" }],
      totalItems: 1000,
      page: 101,
      pageSize: 10,
    });
    assertEquals(result, {
      data: [{ name: "John Doe" }],
      totalItems: 1000,
      totalPages: 100,
      currentPage: 100,
      pageSize: 10,
    });
  },
);
