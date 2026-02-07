/**
 * @file utility.types.ts
 * Utility types for OpenAPI
 */

/**
 * Transform the input type for OpenAPI query parameters
 * (number or boolean value is treated as string in params)
 * @template T - Input type
 * @property {T[K]} T[K] - Transformed type
 */
export type OpenApiQueryTransform<T> = {
  [K in keyof T]: T[K] extends number | boolean | undefined | null ? string
    : T[K];
};
