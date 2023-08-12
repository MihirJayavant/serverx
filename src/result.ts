export enum StatusCode {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
}

export interface ISuccess<T> {
  status: StatusCode.Ok | StatusCode.Created
  data: T
}

export interface IError {
  status: StatusCode.BadRequest
  error: string
}

export type IResult<T> = ISuccess<T> | IError

export function isSucess<T>(result: IResult<T>): result is ISuccess<T> {
  return result.status === StatusCode.Ok || result.status === StatusCode.Created
}

export function isError<T>(result: IResult<T>): result is IError {
  return !isSucess(result)
}
