/**
 * @file utility.types.ts
 * Common utility types
 */

/**
 * Prettify
 * @description Makes complex types more readable
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
};

/**
 * StrictOmit
 * @description Omit properties from a type without making them optional
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

/**
 * OptionalExcept
 * @description Make some properties optional while keeping the rest required
 */
export type OptionalExcept<T, K extends keyof T> =
  & Partial<Omit<T, K>>
  & Pick<T, K>;

/**
 * JsonType
 * @description JSON object type
 */
export type JsonType = {
  [x: string]:
    | string
    | boolean
    | number
    | null
    | undefined
    | JsonType
    | JsonArray;
};

/**
 * JsonArray
 * @description JSON array type
 */
export type JsonArray = Array<JsonType>;

/**
 * Task
 * @description Represents a task that can be synchronous or asynchronous
 */
export type Task<T> = T | Promise<T>;
