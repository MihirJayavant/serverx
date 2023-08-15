import helmet, { HelmetOptions } from 'helmet'
import { Context, Next } from 'koa'
import { promisify } from 'util'

export function koaHelmet(options?: Readonly<HelmetOptions>) {
  const helmetPromise = promisify(helmet.apply(null, [options]))

  const middleware = (ctx: Context, next: Next) => helmetPromise(ctx.req, ctx.res).then(next)

  middleware._name = 'helmet'
  return middleware
}

// Object.keys(helmet).forEach(helmetMethod => {
//   const koafn = koaHelmet as any
//   const hel = helmet as any
//   koafn[helmetMethod] = (...args: any[]) => {
//     const methodPromise = promisify(hel[helmetMethod].apply(null, args))

//     return (ctx: Context, next: Next) => methodPromise(ctx.req, ctx.res).then(next)
//   }
//   Object.keys(hel[helmetMethod]).forEach(methodExports => {
//     koafn[helmetMethod][methodExports] = hel[helmetMethod][methodExports]
//   })
// })
