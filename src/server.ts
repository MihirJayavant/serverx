import Koa from 'koa'

export class Server {
  app: Koa

  constructor() {
    this.app = new Koa()
  }

  start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  }
}
