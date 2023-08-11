import * as express from 'express'

export class Server {
  app: express.Express

  constructor() {
    this.app = express()
  }

  start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  }
}
