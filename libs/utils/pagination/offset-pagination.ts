/**
 * @file offset-pagination.ts
 * Helper functions for offset pagination
 */

import type { FilteringParams, SortingParams } from "./filters.ts";

/**
 * Input type for Offset-Based Pagination in rest handler
 * @property {number} page - Current page number
 * @property {number} pageSize - Number of items per page
 * @property {FilteringParams} [filters] - Applied filters
 * @property {SortingParams} [sort] - Applied sorting
 */
export type OffsetPaginationParams = {
  page: number;
  pageSize: number;
  filters?: FilteringParams;
  sort?: SortingParams;
};

/**
 * Output type for Offset-Based Pagination
 * @property {T[]} data - Current page data
 * @property {number} totalItems - Total number of items
 * @property {number} totalPages - Total pages
 * @property {number} currentPage - Current page number
 * @property {number} pageSize - Number of items per page
 */
export type OffsetPaginatedResult<T> = {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

/**
 * Input type for Offset-Based Pagination
 * @property {T[]} items - Items for the current page
 * @property {number} totalItems - Total number of items
 * @property {number} page - Current page number
 * @property {number} pageSize - Number of items per page
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
 * @param {OffsetPaginationInput<T>} result - Input object containing items, totalItems, page, and pageSize
 * @returns {OffsetPaginatedResult<T>} PaginatedResult containing the current page data and metadata
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
