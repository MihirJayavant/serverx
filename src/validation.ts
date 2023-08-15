import { ObjectSchema } from 'joi'
import { Next, Context } from 'koa'

export async function validateQuery<T>(schema: ObjectSchema<T>) {
  return (ctx: Context, next: Next) => {
    const { error } = schema.validate(ctx.request.query)
    if (error) {
      ctx.status = 400
      ctx.body = { error }
      return
    }
    next()
  }
}

export async function validateBody<T>(schema: ObjectSchema<T>) {
  return (ctx: Context, next: Next) => {
    const { error } = schema.validate(ctx.request.body)
    if (error) {
      ctx.status = 400
      ctx.body = { error }
      return
    }
    next()
  }
}
