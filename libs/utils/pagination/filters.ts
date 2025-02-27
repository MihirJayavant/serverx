/**
 * @file filters.ts
 * Helper functions for filtering and sorting
 */

/**
 * Sorting parameters
 * @property {string} field - Field to sort by
 * @property {"asc" | "desc"} order - Sorting order: ascending or descending
 * @property {number} priority - Sorting priority
 */
export type SortingParams = {
  field: string;
  order: "asc" | "desc";
  priority: number;
};

/**
 * Value type for filtering
 */
export type FilterValueType = string | string[];

/**
 * Key-value pairs for filters
 */
export type FilteringParams = {
  [key: string]: FilterValueType;
};
