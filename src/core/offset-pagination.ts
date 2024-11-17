/**
 * @module offset-pagination
 * Helper functions for offset pagination
 */

// Pagination Input
export type PaginationParams = {
    page: number; // Current page number
    pageSize: number; // Number of items per page
};

// Sorting Input
export type SortingParams = {
    field: string; // Field to sort by
    order: "asc" | "desc"; // Sorting order: ascending or descending
    priority: number; // Sorting priority
};

export type FilterValueType = string | string[];

// Filtering Input
export type FilteringParams = {
    [key: string]: FilterValueType; // key-value pairs for filters
};

// Pagination Result
export type PaginatedResult<T> = {
    data: T[]; // Current page data
    totalItems: number; // Total number of items
    totalPages: number; // Total pages
    currentPage: number; // Current page number
    pageSize: number; // Number of items per page
    filters?: FilteringParams; // Applied filters
    sort?: SortingParams; // Applied sorting
};

type OffsetPaginationInput<T> = {
    items: T[];
    totalItems: number;
    params: PaginationParams;
    filters?: FilteringParams;
    sort?: SortingParams;
};

/**
 * Helper function for offset pagination
 *
 * @param {OffsetPaginationInput} { items, totalItems, params, filters, sort }
 * @returns PaginatedResult containing the current page data and metadata
 */
export function paginate<T>(
    { items, totalItems, params, filters, sort }: OffsetPaginationInput<T>,
): PaginatedResult<T> {
    const { page, pageSize } = params;

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
        filters,
        sort,
    };
}
