import { Response } from 'express'
import { ObjectSchema } from 'joi'
import { IResult, StatusCode, isSucess } from 'result'

export interface IHandler<T, U> {
  run(payload: T): Promise<IResult<U>>
}

function createRequestHandler<T, U>(handler: IHandler<T, U>, validationSchema: ObjectSchema<T>) {
  return async (data: T) => {
    await validationSchema.validateAsync(data)
    return await handler.run(data)
  }
}

async function mediator<T>(config: { handler: (data: T) => Promise<IResult<T>>; data: T; res: Response }) {
  try {
    const result = await config.handler(config.data)
    if (isSucess(result)) {
      config.res.status(result.status).send(result.data)
    } else {
      config.res.status(result.status).send(result.error)
    }
  } catch (error: any) {
    console.error(`Error in Handler `, error.stack ?? error)
  }
}
