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

export type SuccessResult<T> = {
    status: number;
    data: T;
};

export type ErrorResult<T> = {
    status: number;
    error: T;
};

export type Result<TSuccess, TError> =
    | SuccessResult<TSuccess>
    | ErrorResult<TError>;

export function isSucess<TSuccess, TError>(
    result: Result<TSuccess, TError>,
): result is SuccessResult<TSuccess> {
    return result.status >= 200 && result.status <= 400;
}

export function isError<TSuccess, TError>(
    result: Result<TSuccess, TError>,
): result is ErrorResult<TError> {
    return !isSucess(result);
}

export function internalServerError<TError>(
    error: TError,
): ErrorResult<TError> {
    return {
        status: 500,
        error,
    };
}
