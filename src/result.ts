export const statusCodes = {
    Ok: 200,
    Created: 201,
    NoContent: 204,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    InternalServerError: 500,
} as const;

export type StatusCode = (typeof statusCodes)[keyof typeof statusCodes];

export type SuccessStatusCode = 200 | 201 | 204;

export type ErrorStatusCode = Exclude<StatusCode, SuccessStatusCode>;

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
