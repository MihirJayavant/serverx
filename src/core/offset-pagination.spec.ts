import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { offsetPaginate } from "./offset-pagination.ts";

const offsetPaginateTest = describe(offsetPaginate.name);

const input = {
  items: [{ name: "John Doe" }],
  totalItems: 1000,
  page: 5,
  pageSize: 10,
};

const output = {
  data: [{ name: "John Doe" }],
  totalItems: 1000,
  totalPages: 100,
  currentPage: 5,
  pageSize: 10,
};

it(offsetPaginateTest, "should return paginated result", () => {
  const result = offsetPaginate(input);
  assertEquals(result, output);
});

it(
  offsetPaginateTest,
  "should return paginated result with 1 page size for negastive page",
  () => {
    const result = offsetPaginate({
      ...input,
      page: -1,
    });
    assertEquals(result, {
      ...output,
      currentPage: 1,
    });
  },
);

it(
  offsetPaginateTest,
  "should return paginated result with last page size for page size greater than total pages",
  () => {
    const result = offsetPaginate({
      ...input,
      page: 101,
    });
    assertEquals(result, {
      ...output,
      currentPage: 100,
    });
  },
);
