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

/**
 * Selector parameters
 */
export type SelectorParams<T> = Array<keyof T>;

/**
 * Selector type to be used with external databse libraries like Mongoose, TypeORM, Drizzle, etc.
 */
export type Selector<T> = Partial<Record<keyof T, 1>>;

/**
 * Convert filtering parameters to a format that can be used with external database libraries
 * @param selector - Selector parameters
 * @returns - Selector object that can be used with external database libraries
 */
export function convertSelector<T>(
  selector: SelectorParams<T>,
): Selector<T> {
  const result: Selector<T> = {};
  for (const key of selector) {
    result[key] = 1;
  }
  return result;
}
