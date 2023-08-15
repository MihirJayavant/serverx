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

export interface ISuccess<T> {
  status: StatusCode.Ok | StatusCode.Created | StatusCode.NoContent
  data: T
}

export interface IError {
  status:
    | StatusCode.BadRequest
    | StatusCode.Conflict
    | StatusCode.Forbidden
    | StatusCode.InternalServerError
    | StatusCode.NotFound
    | StatusCode.Unauthorized
  error: string
}

export type IResult<T> = ISuccess<T> | IError

export function isSucess<T>(result: IResult<T>): result is ISuccess<T> {
  return (
    result.status === StatusCode.Ok || result.status === StatusCode.Created || result.status === StatusCode.NoContent
  )
}

export function isError<T>(result: IResult<T>): result is IError {
  return !isSucess(result)
}
