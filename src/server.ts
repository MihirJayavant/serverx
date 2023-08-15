import Koa from 'koa'
import { koaHelmet } from './security'
import { HelmetOptions } from 'helmet'
import cors from '@koa/cors'
import { Logger } from './logger'
import { bodyParser } from '@koa/bodyparser'
import Router from '@koa/router'
import serve from 'koa-static'
import compress from 'koa-compress'

export class Server {
  app: Koa

  constructor() {
    this.app = new Koa()
  }

  addEssentials(config?: IEssentialsConfig) {
    this.addLogs()
    this.addResponseTime()
    this.app.use(cors(config?.cors))
    this.app.use(koaHelmet(config?.helmet))
    this.app.use(bodyParser())
    this.app.use(compress(config?.compress))
  }

  addLogs() {
    this.app.use(async (ctx, next) => {
      await next()
      const rt = ctx.response.get('X-Response-Time')
      Logger.info(`${ctx.method} ${ctx.url} - ${rt}`)
    })
  }

  addResponseTime() {
    this.app.use(async (ctx, next) => {
      const start = Date.now()
      await next()
      const ms = Date.now() - start
      ctx.set('X-Response-Time', `${ms}ms`)
    })
  }

  addRoute(router: Router<Koa.DefaultState, Koa.DefaultContext>) {
    this.app.use(router.routes()).use(router.allowedMethods())
  }

  addStaticFiles(root: string, opts?: serve.Options) {
    this.app.use(serve(root, opts))
  }

  start(port: number) {
    this.app.listen(port, () => {
      Logger.info(`Server is running on port ${port}`)
    })
  }
}

export interface IEssentialsConfig {
  helmet?: Readonly<HelmetOptions>
  cors?: cors.Options
  compress?: compress.CompressOptions
}
