import { pino } from 'pino'

export class Logger {
  static _logger = pino()

  static info(msg: string, ...args: any[]) {
    this._logger.info(msg, ...args)
  }

  static error(msg: string, ...args: any[]) {
    this._logger.error(msg, ...args)
  }
}
