import type { JsonType } from "../utility.types.ts";

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

export type StatusCode = (typeof statusCodes)[keyof typeof statusCodes];

export type SuccessStatusCode = 200 | 201 | 202 | 204;

export type RedirectStatusCode = 301 | 302 | 304;

export type ErrorStatusCode = Exclude<
  StatusCode,
  SuccessStatusCode | RedirectStatusCode
>;

export type SuccessResult<T extends JsonType> = {
  status: SuccessStatusCode | RedirectStatusCode;
  data: T;
};

export type ErrorResult = {
  status: ErrorStatusCode;
  error: unknown;
};

export type Result<T extends JsonType> =
  | SuccessResult<T>
  | ErrorResult;

export function isSuccess<T extends JsonType>(
  result: Result<T>,
): result is SuccessResult<T> {
  return result.status >= 200 && result.status < 400;
}

export function isError<T extends JsonType>(
  result: Result<T>,
): result is ErrorResult {
  return !isSuccess(result);
}

export function internalServerError(
  error: unknown,
): ErrorResult {
  return {
    status: 500,
    error,
  };
}

export function errorResult(
  status: ErrorStatusCode,
  error: unknown,
): ErrorResult {
  return {
    status,
    error,
  };
}

export function successResult<T extends JsonType>(
  data: T,
  status: SuccessStatusCode = 200,
): SuccessResult<T> {
  return {
    data,
    status,
  };
}
