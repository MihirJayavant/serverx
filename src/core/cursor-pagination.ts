/**
 * @module cursor-pagination
 * Helper functions for cursor pagination
 */

import type { FilteringParams, SortingParams } from "./filters.ts";

/**
 * Input type for Cursor-Based Pagination in rest handler
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
};

/**
 * Input type for Cursor-Based Pagination
 */
export type CursorPaginationInput<T> = {
  items: T[];
  totalItems: number;
  after?: string | null; // Cursor pointing to the item after which results should start
  before?: string | null; // Cursor pointing to the item before which results should start (optional, for reverse pagination)
  limit: number; // Maximum number of items to fetch
};

export function cursorPaginate<T>(
  params: CursorPaginationInput<T>,
): CursorPaginatedResult<T> {
  const { items, after, before, limit } = params;
  const hasNextPage = after ? items.length === limit : false;
  const hasPreviousPage = before ? items.length === limit : false;
  return {
    data: items,
    hasNextPage,
    hasPreviousPage,
  };
}
