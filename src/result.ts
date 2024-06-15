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

export interface ISuccess<T> {
    status: number;
    data: T;
}

export interface IError {
    status: number;
    error: string;
}

export type IResult<T> = ISuccess<T> | IError;

export function isSucess<T>(result: IResult<T>): result is ISuccess<T> {
    return result.status >= 200 && result.status <= 400;
}

export function isError<T>(result: IResult<T>): result is IError {
    return !isSucess(result);
}
