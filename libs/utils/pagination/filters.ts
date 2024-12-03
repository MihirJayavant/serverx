/**
 * Sorting Input
 */
export type SortingParams = {
  field: string; // Field to sort by
  order: "asc" | "desc"; // Sorting order: ascending or descending
  priority: number; // Sorting priority
};

/**
 * Filtering value type
 */
export type FilterValueType = string | string[];

/**
 * Filtering Input
 */
export type FilteringParams = {
  [key: string]: FilterValueType; // key-value pairs for filters
};
