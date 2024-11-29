/**
 * @module offset-pagination
 * Helper functions for offset pagination
 */

import type { FilteringParams, SortingParams } from "./filters.ts";

/**
 * Input type for Offset-Based Pagination in rest handler
 */
export type OffsetPaginationParams = {
  page: number; // Current page number
  pageSize: number; // Number of items per page
  filters?: FilteringParams; // Applied filters
  sort?: SortingParams; // Applied sorting
};

/**
 * Output type for Offset-Based Pagination
 */
export type OffsetPaginatedResult<T> = {
  data: T[]; // Current page data
  totalItems: number; // Total number of items
  totalPages: number; // Total pages
  currentPage: number; // Current page number
  pageSize: number; // Number of items per page
};

/**
 * Input type for Offset-Based Pagination
 */
type OffsetPaginationInput<T> = {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
};

/**
 * Helper function for offset pagination
 *
 * @param {OffsetPaginationInput} result - Input object containing items, totalItems, page, and pageSize
 * @returns PaginatedResult containing the current page data and metadata
 */
export function offsetPaginate<T>(
  result: OffsetPaginationInput<T>,
): OffsetPaginatedResult<T> {
  const { items, totalItems, page, pageSize } = result;
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure the page number is within range
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  return {
    data: items,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
  };
}
