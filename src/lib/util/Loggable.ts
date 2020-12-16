import { Logger } from 'log4js'

export default abstract class Loggable {
  protected logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  getLogger() {
    return this.logger
  }
}
