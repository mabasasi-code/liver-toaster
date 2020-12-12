import BasePushHandler from "./handler/BasePushHandler"
import DumpHandler from "./handler/DumpHandler"
import YoutubeHandler from "./handler/YoutubeHandler"
import TestHandler from "./handler/TestHandler"
import PushInterface from "./interface/pushbullet/PushInterface"
import { NotifyLog } from "../logger/Logger"

export default class MessageHandler {

  private handlers: BasePushHandler[]

  constructor () {
    this.handlers = []
    this.handlers.push(new DumpHandler())
    this.handlers.push(new YoutubeHandler())
    this.handlers.push(new TestHandler())
  }

  public async invoke (push: PushInterface) {
    // 一つずつ全て実行する
    for (const handler of this.handlers) {
      try {
        const isValid = handler.isValid(push)
        if (isValid) {
          await handler.handle(push)
        }
      } catch (err) {
        NotifyLog.error(err)
      }
    }
  }
}
