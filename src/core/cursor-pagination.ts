/**
 * @module cursor-pagination
 * Helper functions for cursor pagination
 */

import type { FilteringParams, SortingParams } from "./filters.ts";

/**
 * Input type for Cursor-Based Pagination
 */
export type CursorPaginationParams = {
  after?: string | null; // Cursor pointing to the item after which results should start
  before?: string | null; // Cursor pointing to the item before which results should start (optional, for reverse pagination)
  limit: number; // Maximum number of items to fetch
  filters?: FilteringParams; // Applied filters
  sort?: SortingParams; // Applied sorting
};

/**
 * Output type for Cursor-Based Pagination
 */
export type CursorPaginatedResult<T> = {
  data: T[]; // Current page data
  hasNextPage: boolean; // Whether there are more items after the current page
  hasPreviousPage: boolean; // Whether there are items before the current page
  startCursor?: string; // Cursor for the first item in the current page
  endCursor?: string; // Cursor for the last item in the current page
};
