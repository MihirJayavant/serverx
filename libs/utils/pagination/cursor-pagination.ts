/**
 * @module cursor-pagination
 * Helper functions for cursor pagination
 */

import type { FilteringParams, SortingParams } from "./filters.ts";

/**
 * CursorPaginationParams
 * @property {string} [after] - Cursor pointing to the item after which results should start
 * @property {string} [before] - Cursor pointing to the item before which results should start (optional, for reverse pagination)
 * @property {number} limit - Maximum number of items to fetch
 * @property {FilteringParams} [filters] - Applied filters
 * @property {SortingParams} [sort] - Applied sorting
 */
export type CursorPaginationParams = {
  after?: string | null;
  before?: string | null;
  limit: number;
  filters?: FilteringParams;
  sort?: SortingParams;
};

/**
 * CursorPaginatedResult
 * @property {T[]} data - Current page data
 * @property {number} limit - Maximum number of items to fetch
 * @property {boolean} hasNextPage - Whether there are more items after the current page
 * @property {boolean} hasPreviousPage - Whether there are items before the current page
 */
export type CursorPaginatedResult<T> = {
  data: T[]; // Current page data
  limit: number; // Maximum number of items to fetch
  hasNextPage: boolean; // Whether there are more items after the current page
  hasPreviousPage: boolean; // Whether there are items before the current page
};
