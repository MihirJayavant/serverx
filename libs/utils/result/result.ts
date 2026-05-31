/**
 * @file result.ts
 * Helper functions for handling API results
 */

import type { JsonType } from "../utility.types.ts";

/**
 * Map of common HTTP status codes.
 *
 * @example
 * ```ts
 * errorResult("Not found", statusCodes.NotFound);
 * successResult(user, statusCodes.Created);
 * ```
 */
export const statusCodes = {
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NoContent: 204,
  MovedPermanently: 301,
  Found: 302,
  NotModified: 304,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
} as const;

/** Union of all HTTP status code values in {@link statusCodes}. */
export type StatusCode = (typeof statusCodes)[keyof typeof statusCodes];

/** Status codes that carry a response body: 200, 201, 202. */
export type ContentfulSuccessStatusCode = 200 | 201 | 202;

/** Status code for responses with no body: 204. */
export type NonContentfulSuccessStatusCode = 204;

/** Union of all 2xx status codes. */
export type SuccessStatusCode =
  | ContentfulSuccessStatusCode
  | NonContentfulSuccessStatusCode;

/** Status codes for redirect responses: 301, 302, 304. */
export type RedirectStatusCode = 301 | 302 | 304;

/** All status codes that represent an error (4xx and 5xx). */
export type ErrorStatusCode = Exclude<
  StatusCode,
  SuccessStatusCode | RedirectStatusCode
>;

/**
 * A successful result that carries a response body.
 *
 * @template T - The shape of the response data.
 */
export type ContentfulSuccessResult<T extends JsonType> = {
  status: ContentfulSuccessStatusCode;
  data: T;
};

/**
 * A successful result with no response body (204) or a redirect (3xx).
 * `data` is always `null`.
 */
export type NonContentfulSuccessResult = {
  status: NonContentfulSuccessStatusCode | RedirectStatusCode;
  data: null;
};

/**
 * Union of all successful result shapes.
 *
 * @template T - The shape of the response data for contentful results.
 */
export type SuccessResult<T extends JsonType> =
  | ContentfulSuccessResult<T>
  | NonContentfulSuccessResult;

/**
 * An error result carrying a status code and the error value.
 * The `error` field is intentionally `unknown` — callers should narrow it.
 */
export type ErrorResult = {
  status: ErrorStatusCode;
  error: unknown;
};

/**
 * Discriminated union returned by all handlers.
 * Use {@link isSuccess} or {@link isError} to narrow before accessing fields.
 *
 * @template T - The shape of the response data on the success branch.
 *
 * @example
 * ```ts
 * function getUser(id: string): Result<User> {
 *   const user = db.find(id);
 *   return user ? successResult(user) : errorResult("Not found", statusCodes.NotFound);
 * }
 * ```
 */
export type Result<T extends JsonType> =
  | SuccessResult<T>
  | ErrorResult;

/**
 * Type guard — narrows `result` to {@link SuccessResult}.
 *
 * @example
 * ```ts
 * if (isSuccess(result)) {
 *   console.log(result.data);
 * }
 * ```
 */
export function isSuccess<T extends JsonType>(
  result: Result<T>,
): result is SuccessResult<T> {
  return result.status >= 200 && result.status < 400;
}

/**
 * Type guard — narrows `result` to {@link ErrorResult}.
 *
 * @example
 * ```ts
 * if (isError(result)) {
 *   console.log(result.error);
 * }
 * ```
 */
export function isError<T extends JsonType>(
  result: Result<T>,
): result is ErrorResult {
  return !isSuccess(result);
}

/**
 * Creates a 500 Internal Server Error result.
 * Use in `catch` blocks where the error is unexpected.
 *
 * @param error - The caught error value.
 *
 * @example
 * ```ts
 * try {
 *   return successResult(await db.getUser(id));
 * } catch (e) {
 *   return internalServerError(e);
 * }
 * ```
 */
export function internalServerError(
  error: unknown,
): ErrorResult {
  return {
    status: 500,
    error,
  };
}

/**
 * Creates an error result with the given status code.
 *
 * @param error - A message, object, or any value describing the error.
 * @param status - An HTTP error status code (4xx or 5xx).
 *
 * @example
 * ```ts
 * errorResult("User not found", statusCodes.NotFound);
 * errorResult({ message: "Email taken" }, statusCodes.Conflict);
 * ```
 */
export function errorResult(
  error: unknown,
  status: ErrorStatusCode,
): ErrorResult {
  return {
    status,
    error,
  };
}

/**
 * Creates a success result.
 * Pass `null` as data with `statusCodes.NoContent` for 204 responses,
 * or a redirect status for 3xx responses — both set `data` to `null`.
 *
 * @param data - The response payload, or `null` for no-content/redirect results.
 * @param status - The HTTP success or redirect status code. Defaults to `200`.
 *
 * @example
 * ```ts
 * successResult(user);                              // 200
 * successResult(user, statusCodes.Created);         // 201
 * successResult(null, statusCodes.NoContent);       // 204
 * successResult(null, statusCodes.Found);           // 302
 * ```
 */
export function successResult<T extends JsonType>(
  data: T | null,
  status: SuccessStatusCode | RedirectStatusCode = 200,
): SuccessResult<T> {
  if (status === 204 || (status >= 300 && status < 400)) {
    return {
      data: null,
      status: status as NonContentfulSuccessStatusCode | RedirectStatusCode,
    };
  }
  return {
    data: data as T,
    status: status as ContentfulSuccessStatusCode,
  };
}
