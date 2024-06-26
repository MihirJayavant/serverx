export enum StatusCode {
    Ok = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    InternalServerError = 500,
}

export type SuccessStatusCode =
    | StatusCode.Ok
    | StatusCode.Created
    | StatusCode.NoContent;

export type ErrorStatusCode =
    | StatusCode.BadRequest
    | StatusCode.Conflict
    | StatusCode.Forbidden
    | StatusCode.InternalServerError
    | StatusCode.NotFound
    | StatusCode.Unauthorized;

export interface SuccessResult<T> {
    status: number;
    data: T;
}

export interface ErrorResult {
    status: number;
    error: string | string[];
}

export type Result<T> = SuccessResult<T> | ErrorResult;

export function isSucess<T>(result: Result<T>): result is SuccessResult<T> {
    return result.status >= 200 && result.status <= 400;
}

export function isError<T>(result: Result<T>): result is ErrorResult {
    return !isSucess(result);
}

export function internalServerError(error?: string | string[]): ErrorResult {
    return {
        status: 500,
        error: error ?? "Internal Server Error",
    };
}
