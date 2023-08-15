import { Context } from 'koa'
import { ObjectSchema } from 'joi'
import { IResult, isSucess } from './result'

export interface IHandler<T, U> {
  run(payload: T): Promise<IResult<U>>
}

export function createRequestHandler<T, U>(handler: IHandler<T, U>, validationSchema: ObjectSchema<T>) {
  return async (data: T) => {
    await validationSchema.validateAsync(data)
    return await handler.run(data)
  }
}

export async function mediator<T>(config: { handler: (data: T) => Promise<IResult<T>>; data: T; ctx: Context }) {
  try {
    const result = await config.handler(config.data)
    if (isSucess(result)) {
      config.ctx.status = result.status
      config.ctx.body = result.data
    } else {
      config.ctx.status = result.status
      config.ctx.body = { error: result.error }
    }
  } catch (error: any) {
    console.error(`Error in Handler `, error.stack ?? error)
  }
}
